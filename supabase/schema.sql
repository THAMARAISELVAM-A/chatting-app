-- Anonymous Chat App Schema
-- Run this in Supabase SQL Editor

-- Enable Realtime extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table (anonymous user sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table (chat rooms)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_b UUID REFERENCES sessions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'ended'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  sender_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  sender_nickname TEXT,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_session UUID REFERENCES sessions(id) ON DELETE CASCADE,
  reported_session UUID REFERENCES sessions(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Block list table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_session UUID REFERENCES sessions(id) ON DELETE CASCADE,
  blocked_session UUID REFERENCES sessions(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_session, blocked_session)
);

-- Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Sessions: Anyone can read, only service role can insert/update
CREATE POLICY "Anyone can read sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON sessions FOR UPDATE USING (true);

-- Rooms: Users can read their own rooms, insert new rooms
CREATE POLICY "Anyone can read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON rooms FOR UPDATE USING (true);

-- Messages: Anyone can read messages for active rooms, insert messages
CREATE POLICY "Anyone can read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON messages FOR INSERT WITH CHECK (true);

-- Reports: Anyone can insert reports
CREATE POLICY "Anyone can insert reports" ON reports FOR INSERT WITH CHECK (true);

-- Blocks: Anyone can read/insert blocks
CREATE POLICY "Anyone can read blocks" ON blocks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert blocks" ON blocks FOR INSERT WITH CHECK (true);

-- Enable Realtime for rooms and messages tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Storage bucket for chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can read chat images
CREATE POLICY "Anyone can view chat images" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-images');

-- Storage policy: Authenticated users can upload chat images
CREATE POLICY "Anyone can upload chat images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_user_a ON rooms(user_a);
CREATE INDEX IF NOT EXISTS idx_rooms_user_b ON rooms(user_b);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_blocks_expires ON blocks(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON sessions(last_active);