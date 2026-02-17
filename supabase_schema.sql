-- SQL Schema for Biolab Box Manager

-- Create boxes table
CREATE TABLE boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rows INTEGER NOT NULL,
    cols INTEGER NOT NULL,
    description TEXT,
    cells JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access for now (Anonymous allowed)
-- In production, you'd want to restrict this to authenticated users
CREATE POLICY "Public full access" ON boxes
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function
CREATE TRIGGER update_boxes_updated_at
    BEFORE UPDATE ON boxes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
