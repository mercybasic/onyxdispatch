import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_USERS, INITIAL_CREWS, INITIAL_REQUESTS } from '../data/mockData';

// Helper to check if we're using Supabase or mock data
const useMockData = !isSupabaseConfigured();

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const getUsers = async () => {
  if (useMockData) {
    return { data: INITIAL_USERS, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name');

  return { data, error };
};

export const getUserByDiscordId = async (discordId) => {
  if (useMockData) {
    const user = INITIAL_USERS.find(u => u.discordId === discordId);
    return { data: user || null, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('discord_id', discordId)
    .single();

  return { data, error };
};

export const createOrUpdateUser = async (userData) => {
  if (useMockData) {
    return { data: userData, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .upsert({
      discord_id: userData.discordId,
      discord_username: userData.username,
      name: userData.name,
      avatar: userData.avatar,
      role: userData.role,
      online: true
    }, {
      onConflict: 'discord_id'
    })
    .select()
    .single();

  return { data, error };
};

export const updateUserOnlineStatus = async (userId, online) => {
  if (useMockData) {
    return { data: null, error: null };
  }

  const { error } = await supabase
    .from('users')
    .update({ online })
    .eq('id', userId);

  return { error };
};

// ============================================================================
// CREW OPERATIONS
// ============================================================================

export const getCrews = async () => {
  if (useMockData) {
    return { data: INITIAL_CREWS, error: null };
  }

  const { data, error } = await supabase
    .from('crews')
    .select(`
      *,
      crew_members (
        user_id,
        is_lead,
        users (*)
      )
    `)
    .order('name');

  return { data, error };
};

export const getCrewById = async (crewId) => {
  if (useMockData) {
    const crew = INITIAL_CREWS.find(c => c.id === crewId);
    return { data: crew || null, error: null };
  }

  const { data, error } = await supabase
    .from('crews')
    .select(`
      *,
      crew_members (
        user_id,
        is_lead,
        users (*)
      )
    `)
    .eq('id', crewId)
    .single();

  return { data, error };
};

export const updateCrew = async (crewId, updates) => {
  if (useMockData) {
    return { data: { id: crewId, ...updates }, error: null };
  }

  const { data, error } = await supabase
    .from('crews')
    .update(updates)
    .eq('id', crewId)
    .select()
    .single();

  return { data, error };
};

export const createCrew = async (crewData) => {
  if (useMockData) {
    return { data: { id: Date.now().toString(), ...crewData }, error: null };
  }

  const { data, error } = await supabase
    .from('crews')
    .insert(crewData)
    .select()
    .single();

  return { data, error };
};

// ============================================================================
// SERVICE REQUEST OPERATIONS
// ============================================================================

export const getServiceRequests = async (filters = {}) => {
  if (useMockData) {
    let filtered = INITIAL_REQUESTS;
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }
    return { data: filtered, error: null };
  }

  let query = supabase
    .from('service_requests')
    .select(`
      *,
      requester:requester_id (id, name, discord_username),
      assigned_crew:assigned_crew_id (id, name, callsign),
      dispatcher:dispatcher_id (id, name)
    `)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getServiceRequestById = async (requestId) => {
  if (useMockData) {
    const request = INITIAL_REQUESTS.find(r => r.id === requestId);
    return { data: request || null, error: null };
  }

  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      requester:requester_id (id, name, discord_username),
      assigned_crew:assigned_crew_id (id, name, callsign),
      dispatcher:dispatcher_id (id, name)
    `)
    .eq('id', requestId)
    .single();

  return { data, error };
};

export const createServiceRequest = async (requestData) => {
  if (useMockData) {
    return {
      data: {
        id: Date.now().toString(),
        ...requestData,
        createdAt: Date.now()
      },
      error: null
    };
  }

  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      type: requestData.type,
      priority: requestData.priority,
      status: requestData.status || 'pending',
      location: requestData.location,
      description: requestData.description,
      requester_id: requestData.requesterId,
      requester_name: requestData.requesterName,
      discord_username: requestData.discordUsername,
      assigned_crew_id: requestData.assignedCrewId || null,
      dispatcher_id: requestData.dispatcherId || null
    })
    .select()
    .single();

  return { data, error };
};

export const updateServiceRequest = async (requestId, updates) => {
  if (useMockData) {
    return { data: { id: requestId, ...updates }, error: null };
  }

  const updateData = {};
  if (updates.status) updateData.status = updates.status;
  if (updates.assignedCrewId !== undefined) updateData.assigned_crew_id = updates.assignedCrewId;
  if (updates.dispatcherId) updateData.dispatcher_id = updates.dispatcherId;
  if (updates.status === 'completed') updateData.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('service_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single();

  return { data, error };
};

export const assignCrewToRequest = async (requestId, crewId, dispatcherId) => {
  if (useMockData) {
    return { data: { id: requestId, assignedCrewId: crewId, status: 'assigned' }, error: null };
  }

  const { data, error } = await supabase
    .from('service_requests')
    .update({
      assigned_crew_id: crewId,
      dispatcher_id: dispatcherId,
      status: 'assigned'
    })
    .eq('id', requestId)
    .select()
    .single();

  // Also update crew status to on-mission
  if (!error) {
    await updateCrew(crewId, { status: 'on-mission' });
  }

  return { data, error };
};

// ============================================================================
// ACTIVITY LOG OPERATIONS
// ============================================================================

export const getRecentActivity = async (limit = 10) => {
  if (useMockData) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('activity_log')
    .select(`
      *,
      user:user_id (name),
      request:request_id (id, type),
      crew:crew_id (name, callsign)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};

export const logActivity = async (activityData) => {
  if (useMockData) {
    return { data: null, error: null };
  }

  const { error } = await supabase
    .from('activity_log')
    .insert({
      type: activityData.type,
      user_id: activityData.userId,
      request_id: activityData.requestId,
      crew_id: activityData.crewId,
      message: activityData.message,
      metadata: activityData.metadata
    });

  return { error };
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const subscribeToServiceRequests = (callback) => {
  if (useMockData) {
    return { unsubscribe: () => {} };
  }

  const subscription = supabase
    .channel('service_requests')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'service_requests' },
      callback
    )
    .subscribe();

  return subscription;
};

export const subscribeToCrews = (callback) => {
  if (useMockData) {
    return { unsubscribe: () => {} };
  }

  const subscription = supabase
    .channel('crews')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'crews' },
      callback
    )
    .subscribe();

  return subscription;
};

export const subscribeToUsers = (callback) => {
  if (useMockData) {
    return { unsubscribe: () => {} };
  }

  const subscription = supabase
    .channel('users')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'users' },
      callback
    )
    .subscribe();

  return subscription;
};
