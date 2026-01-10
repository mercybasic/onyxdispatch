import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseData = (currentUser) => {
  const [crews, setCrews] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    if (!supabase || !currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch crews
      const { data: crewsData, error: crewsError } = await supabase
        .from('crews')
        .select('*')
        .order('created_at', { ascending: false });

      if (crewsError) throw crewsError;

      // Fetch service requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (usersError) throw usersError;

      // Fetch activity log
      const { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activityError) throw activityError;

      // Transform data to match frontend format
      setCrews(crewsData?.map(crew => ({
        id: crew.id,
        name: crew.name,
        callsign: crew.callsign,
        ship: crew.ship,
        status: crew.status,
        capabilities: crew.capabilities || [],
        location: crew.location || 'Unknown',
        members: [] // Will be populated from users
      })) || []);

      setRequests(requestsData?.map(req => ({
        id: req.id,
        type: req.type,
        priority: req.priority,
        status: req.status,
        location: req.location,
        description: req.description,
        requesterName: req.requester_name,
        createdAt: new Date(req.created_at).getTime(),
        assignedCrew: req.assigned_crew_id,
        dispatcherId: req.dispatcher_id
      })) || []);

      setUsers(usersData?.map(user => ({
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar || '👤',
        online: user.online || false,
        crewId: user.crew_id,
        discordId: user.discord_id
      })) || []);

      setActivityLog(activityData?.map(activity => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        createdAt: new Date(activity.created_at).getTime(),
        userId: activity.user_id,
        requestId: activity.request_id,
        crewId: activity.crew_id
      })) || []);

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    // Don't set up subscriptions during logout
    if (!supabase || !currentUser || window._isLoggingOut) {
      setLoading(false);
      return;
    }

    fetchData();

    // Subscribe to crews changes
    const crewsSubscription = supabase
      .channel('crews_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crews' }, () => {
        if (!window._isLoggingOut) {
          fetchData();
        }
      })
      .subscribe();

    // Subscribe to requests changes
    const requestsSubscription = supabase
      .channel('requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => {
        if (!window._isLoggingOut) {
          fetchData();
        }
      })
      .subscribe();

    // Subscribe to users changes
    const usersSubscription = supabase
      .channel('users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        if (!window._isLoggingOut) {
          fetchData();
        }
      })
      .subscribe();

    // Subscribe to activity log
    const activitySubscription = supabase
      .channel('activity_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, () => {
        if (!window._isLoggingOut) {
          fetchData();
        }
      })
      .subscribe();

    return () => {
      crewsSubscription.unsubscribe();
      requestsSubscription.unsubscribe();
      usersSubscription.unsubscribe();
      activitySubscription.unsubscribe();
    };
  }, [currentUser]);

  // Create or update user in database
  const syncUser = async (user) => {
    if (!supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          discord_id: user.discordId,
          discord_username: user.name,
          name: user.name,
          avatar: user.avatar,
          role: user.role || 'crew',
          online: true,
          last_seen: new Date().toISOString()
        }, {
          onConflict: 'discord_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error syncing user:', err);
    }
  };

  // Update user's last_seen timestamp (heartbeat - accepts either database UUID or discord_id)
  const updatePresence = async (userIdentifier) => {
    if (!supabase || !userIdentifier) return;

    try {
      // Try to update by discord_id first (most common case)
      const { data, error } = await supabase
        .from('users')
        .update({
          online: true,
          last_seen: new Date().toISOString()
        })
        .eq('discord_id', userIdentifier)
        .select();

      // If no rows updated, try by database id
      if (data && data.length === 0) {
        await supabase
          .from('users')
          .update({
            online: true,
            last_seen: new Date().toISOString()
          })
          .eq('id', userIdentifier);
      }

      if (error) throw error;
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  };

  // Set user offline (accepts either database UUID or discord_id)
  const setUserOffline = async (userIdentifier) => {
    if (!supabase || !userIdentifier) return;

    try {
      console.log('setUserOffline called with:', userIdentifier);

      // Try to update by discord_id first (most common case)
      const { data, error } = await supabase
        .from('users')
        .update({
          online: false,
          last_seen: new Date().toISOString()
        })
        .eq('discord_id', userIdentifier)
        .select();

      if (error) {
        console.error('Error updating by discord_id:', error);
        throw error;
      }

      console.log('setUserOffline result:', data);

      // If no rows updated, try by database id
      if (data && data.length === 0) {
        console.log('No rows updated by discord_id, trying by id...');
        const { data: data2, error: error2 } = await supabase
          .from('users')
          .update({
            online: false,
            last_seen: new Date().toISOString()
          })
          .eq('id', userIdentifier)
          .select();

        if (error2) {
          console.error('Error updating by id:', error2);
          throw error2;
        }

        console.log('setUserOffline by id result:', data2);
      }
    } catch (err) {
      console.error('Error setting user offline:', err);
      // Don't throw - we want logout to continue even if this fails
    }
  };

  // Create a new service request
  const createRequest = async (requestData) => {
    if (!supabase || !currentUser) return null;

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          type: requestData.type,
          priority: requestData.priority,
          location: requestData.location,
          description: requestData.description,
          requester_name: requestData.requesterName,
          discord_username: requestData.discordUsername,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create activity log entry
      await supabase.from('activity_log').insert({
        type: 'request_created',
        request_id: data.id,
        message: `New ${requestData.type} request from ${requestData.requesterName}`
      });

      return data;
    } catch (err) {
      console.error('Error creating request:', err);
      throw err;
    }
  };

  // Assign crew to request
  const assignCrew = async (requestId, crewId) => {
    if (!supabase || !currentUser) return;

    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          assigned_crew_id: crewId,
          dispatcher_id: currentUser.id,
          status: 'assigned'
        })
        .eq('id', requestId);

      if (error) throw error;

      // Create activity log entry
      await supabase.from('activity_log').insert({
        type: 'request_assigned',
        request_id: requestId,
        crew_id: crewId,
        user_id: currentUser.id,
        message: `Request assigned to crew`
      });
    } catch (err) {
      console.error('Error assigning crew:', err);
      throw err;
    }
  };

  // Update request status
  const updateRequestStatus = async (requestId, status) => {
    if (!supabase) return;

    try {
      const updateData = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      // Create activity log entry
      await supabase.from('activity_log').insert({
        type: status === 'completed' ? 'mission_completed' : 'request_updated',
        request_id: requestId,
        message: `Request ${status}`
      });
    } catch (err) {
      console.error('Error updating request status:', err);
      throw err;
    }
  };

  // Create a new crew
  const createCrew = async (crewData) => {
    if (!supabase || !currentUser) return null;

    try {
      const { data, error } = await supabase
        .from('crews')
        .insert({
          name: crewData.name,
          callsign: crewData.callsign,
          ship: crewData.ship,
          capabilities: crewData.capabilities || [],
          location: crewData.location,
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating crew:', err);
      throw err;
    }
  };

  // Update crew status
  const updateCrewStatus = async (crewId, status) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('crews')
        .update({ status })
        .eq('id', crewId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating crew status:', err);
      throw err;
    }
  };

  return {
    crews,
    requests,
    users,
    activityLog,
    loading,
    error,
    syncUser,
    updatePresence,
    setUserOffline,
    createRequest,
    assignCrew,
    updateRequestStatus,
    createCrew,
    updateCrewStatus,
    refreshData: fetchData
  };
};

export default useSupabaseData;
