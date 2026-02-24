-- ============================================
-- NOTIFICATIONS TABLE - Run this in Supabase SQL Editor
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,  -- Người nhận thông báo
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,          -- Người tạo action (null cho system notifications)
  type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'reply', 'mention', 'message', 'fork', 'welcome')),
  tactic_id UUID REFERENCES public.tactics(id) ON DELETE CASCADE,          -- Optional: cho like/comment/fork
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,        -- Optional: cho reply/mention
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE, -- Optional: cho message
  content TEXT,                                                             -- Optional: nội dung bổ sung
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- ============================================
-- TRIGGER: Auto-create notification on follow
-- ============================================
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_follow_notification ON public.follows;
CREATE TRIGGER trigger_follow_notification
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION create_follow_notification();

-- ============================================
-- TRIGGER: Auto-create notification on like
-- ============================================
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  tactic_author_id UUID;
BEGIN
  -- Get the author of the tactic
  SELECT author_id INTO tactic_author_id FROM public.tactics WHERE id = NEW.tactic_id;
  
  -- Don't notify if user likes own tactic
  IF tactic_author_id IS NOT NULL AND tactic_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, tactic_id)
    VALUES (tactic_author_id, NEW.user_id, 'like', NEW.tactic_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_like_notification ON public.likes;
CREATE TRIGGER trigger_like_notification
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION create_like_notification();

-- ============================================
-- TRIGGER: Auto-create notification on comment
-- ============================================
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  tactic_author_id UUID;
  parent_comment_author_id UUID;
BEGIN
  -- Get the author of the tactic
  SELECT author_id INTO tactic_author_id FROM public.tactics WHERE id = NEW.tactic_id;
  
  -- If this is a reply (has parent_id), notify the parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_comment_author_id FROM public.comments WHERE id = NEW.parent_id;
    
    IF parent_comment_author_id IS NOT NULL AND parent_comment_author_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, actor_id, type, tactic_id, comment_id)
      VALUES (parent_comment_author_id, NEW.user_id, 'reply', NEW.tactic_id, NEW.id);
    END IF;
  END IF;
  
  -- Notify tactic author about new comment (if not same as commenter and not already notified as reply)
  IF tactic_author_id IS NOT NULL AND tactic_author_id != NEW.user_id 
     AND (NEW.parent_id IS NULL OR tactic_author_id != parent_comment_author_id) THEN
    INSERT INTO public.notifications (user_id, actor_id, type, tactic_id, comment_id)
    VALUES (tactic_author_id, NEW.user_id, 'comment', NEW.tactic_id, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_comment_notification ON public.comments;
CREATE TRIGGER trigger_comment_notification
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION create_comment_notification();

-- ============================================
-- TRIGGER: Auto-create notification on message
-- ============================================
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  participant RECORD;
BEGIN
  -- Notify all participants except the sender
  FOR participant IN 
    SELECT user_id FROM public.conversation_participants 
    WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id
  LOOP
    INSERT INTO public.notifications (user_id, actor_id, type, conversation_id)
    VALUES (participant.user_id, NEW.sender_id, 'message', NEW.conversation_id);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_message_notification ON public.messages;
CREATE TRIGGER trigger_message_notification
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION create_message_notification();

-- ============================================
-- Verify setup
-- ============================================
SELECT 'Notifications schema created successfully!' as message;
