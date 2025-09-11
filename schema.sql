-- Create the polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the poll_options table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for the tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for the polls table
CREATE POLICY "Allow all to read polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create polls" ON polls FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for the poll_options table
CREATE POLICY "Allow all to read poll options" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create poll options" ON poll_options FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for the votes table
CREATE POLICY "Allow all to read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow all to vote" ON votes FOR INSERT WITH CHECK (true);
