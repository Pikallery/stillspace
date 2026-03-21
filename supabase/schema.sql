-- MindBridge Database Schema

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text DEFAULT 'student' CHECK (role IN ('student', 'counsellor', 'admin')),
  name text NOT NULL,
  is_banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Triage surveys
CREATE TABLE triage_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  score int NOT NULL,
  level text NOT NULL CHECK (level IN ('ai', 'counsellor', 'emergency')),
  summary text,
  created_at timestamptz DEFAULT now()
);

-- Direct chat messages (between student and counsellor)
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- AI chat messages
CREATE TABLE ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Community posts
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  likes_count int DEFAULT 0,
  is_flagged boolean DEFAULT false,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

-- Post comments
CREATE TABLE post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Counsellor profiles
CREATE TABLE counsellor_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specializations text[],
  rating numeric DEFAULT 4.5,
  is_available boolean DEFAULT true,
  bio text
);

-- Student profiles
CREATE TABLE student_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  triage_score int,
  triage_level text CHECK (triage_level IN ('ai', 'counsellor', 'emergency')),
  assigned_counsellor_id uuid REFERENCES users(id)
);

-- Diary entries
CREATE TABLE diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  background_theme text DEFAULT 'gradient-1',
  created_at timestamptz DEFAULT now()
);

-- Calendar events
CREATE TABLE calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('exam', 'session', 'personal')),
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Todo items
CREATE TABLE todo_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  task text NOT NULL,
  is_done boolean DEFAULT false,
  due_date date,
  created_at timestamptz DEFAULT now()
);

-- Counsellor notes
CREATE TABLE counsellor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counsellor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE counsellor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE counsellor_notes ENABLE ROW LEVEL SECURITY;
