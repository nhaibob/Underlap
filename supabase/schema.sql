-- Supabase Database Schema for Underlap
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate tables (be careful in production!)
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.tactics CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,
  avatar_url TEXT DEFAULT '/assets/avatars/default.png',
  location TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TACTICS TABLE
-- ============================================
CREATE TABLE public.tactics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  formation TEXT DEFAULT '4-4-2',
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_username TEXT DEFAULT 'Anonymous',
  author_name TEXT DEFAULT 'Anonymous',
  author_avatar TEXT DEFAULT '/assets/avatars/default.png',
  players JSONB DEFAULT '[]'::jsonb,
  arrows JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LIKES TABLE
-- ============================================
CREATE TABLE public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_username TEXT NOT NULL,
  tactic_id UUID NOT NULL REFERENCES public.tactics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tactic_id)
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_username TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  tactic_id UUID NOT NULL REFERENCES public.tactics(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);

-- Tactics policies
CREATE POLICY "Public tactics viewable by everyone" ON public.tactics FOR SELECT USING (is_public = true);
CREATE POLICY "Anyone can create tactics" ON public.tactics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tactics" ON public.tactics FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete tactics" ON public.tactics FOR DELETE USING (true);

-- Likes policies
CREATE POLICY "Likes viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Anyone can like" ON public.likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can unlike" ON public.likes FOR DELETE USING (true);

-- Comments policies
CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Anyone can comment" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete own comments" ON public.comments FOR DELETE USING (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_tactics_author_username ON public.tactics(author_username);
CREATE INDEX idx_tactics_created_at ON public.tactics(created_at DESC);
CREATE INDEX idx_likes_tactic_id ON public.likes(tactic_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_comments_tactic_id ON public.comments(tactic_id);

-- ============================================
-- FUNCTIONS: Update likes_count on tactics
-- ============================================
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tactics SET likes_count = likes_count + 1 WHERE id = NEW.tactic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tactics SET likes_count = likes_count - 1 WHERE id = OLD.tactic_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- ============================================
-- FUNCTIONS: Update comments_count on tactics
-- ============================================
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tactics SET comments_count = comments_count + 1 WHERE id = NEW.tactic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tactics SET comments_count = comments_count - 1 WHERE id = OLD.tactic_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- ============================================
-- SAMPLE DATA
-- ============================================
INSERT INTO public.tactics (title, description, formation, author_username, author_name, players, arrows, tags)
VALUES 
(
  'Phản công cánh phải (4-3-3)',
  'Sơ đồ tập trung vào khả năng chuyển đổi trạng thái nhanh từ phòng ngự sang tấn công.',
  '4-3-3',
  'HuySon',
  'Huy Sơn',
  '[{"id":"p1","position":"GK","label":"GK","pos":{"x":50,"y":200}},{"id":"p2","position":"LB","label":"LB","pos":{"x":520,"y":180}}]'::jsonb,
  '[]'::jsonb,
  ARRAY['pressing', 'phản công']
);

SELECT 'Schema created successfully!' as message;

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Conversation participants (links users to conversations)
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);
-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  tactic_data JSONB,
  is_suggestion BOOLEAN DEFAULT FALSE,
  original_message_id UUID REFERENCES messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes for performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);
-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- RLS Policies (users can only see their own conversations)
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can view their participations" ON conversation_participants
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- INSERT and UPDATE Policies
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can add participants" ON conversation_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their conversations" ON conversations
  FOR UPDATE USING (
    id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their participation" ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid());