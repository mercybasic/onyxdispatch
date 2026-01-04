-- Onyx Dispatch Database Schema
-- This migration creates the initial database structure for the dispatch system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS crew_members CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS crews CASCADE;

-- Crews table (must be created first due to foreign key reference from users)
CREATE TABLE crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  callsign TEXT UNIQUE NOT NULL,
  ship TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('available', 'on-mission', 'standby', 'offline')),
  location TEXT,
  capabilities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (synced with Discord)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discord_id TEXT UNIQUE NOT NULL,
  discord_username TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL CHECK (role IN ('dispatcher', 'pilot', 'crew')),
  online BOOLEAN DEFAULT false,
  crew_id UUID REFERENCES crews(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service requests table
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('SAR', 'CSAR', 'Refueling', 'Medical', 'Escort', 'Cargo')),
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in-progress', 'completed', 'cancelled')),
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  discord_username TEXT,
  assigned_crew_id UUID REFERENCES crews(id) ON DELETE SET NULL,
  dispatcher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Crew members junction table (for tracking crew membership)
CREATE TABLE crew_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_lead BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(crew_id, user_id)
);

-- Activity log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('request_created', 'request_assigned', 'request_updated', 'crew_dispatched', 'mission_completed', 'user_joined', 'user_left')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  crew_id UUID REFERENCES crews(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_crew_id ON users(crew_id);
CREATE INDEX idx_crews_status ON crews(status);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_type ON service_requests(type);
CREATE INDEX idx_service_requests_created_at ON service_requests(created_at DESC);
CREATE INDEX idx_crew_members_crew_id ON crew_members(crew_id);
CREATE INDEX idx_crew_members_user_id ON crew_members(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON crews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users: Anyone can read, only authenticated users can update their own record
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = discord_id);

-- Crews: Everyone can read, dispatchers and crew leads can update
CREATE POLICY "Crews are viewable by everyone" ON crews
  FOR SELECT USING (true);

CREATE POLICY "Dispatchers can update crews" ON crews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.discord_id = auth.uid()::text
      AND users.role = 'dispatcher'
    )
  );

-- Service requests: Everyone can read and create, dispatchers can update
CREATE POLICY "Requests are viewable by everyone" ON service_requests
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create requests" ON service_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Dispatchers can update requests" ON service_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.discord_id = auth.uid()::text
      AND users.role = 'dispatcher'
    )
  );

-- Crew members: Viewable by all, manageable by dispatchers
CREATE POLICY "Crew members are viewable by everyone" ON crew_members
  FOR SELECT USING (true);

-- Activity log: Viewable by all, insertable by authenticated users
CREATE POLICY "Activity log is viewable by everyone" ON activity_log
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create activity logs" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Insert initial demo data (optional - can be removed for production)
INSERT INTO crews (id, name, callsign, ship, status, location, capabilities) VALUES
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Phoenix Squadron', 'PHOENIX-1', 'Cutlass Red', 'available', 'Crusader - Port Olisar', ARRAY['SAR', 'Medical', 'CSAR']),
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Starrunner Team', 'STARRUN-7', 'Starfarer', 'on-mission', 'Stanton - ARC-L1', ARRAY['Refueling', 'Cargo']);

-- Note: Users will be created automatically when they log in via Discord OAuth
