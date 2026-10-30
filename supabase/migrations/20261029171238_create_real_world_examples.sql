/*
# Create real-life examples board

1. New Tables
- `real_world_examples`
  - `id` (uuid, primary key)
  - `algorithm` (text): which topic the example is about. One of scheduling, producerConsumer, bankers, memory.
  - `author_name` (text, 1-60 characters)
  - `situation` (text, 20-600 characters): the real-life story written by the visitor
  - `created_at` (timestamp)

2. Security
- Row level security is enabled. The app has no sign-in, so visitors use the anon role.
- Anyone can read examples and submit a new one.
- Nobody can edit or delete examples through the app. Those actions have no policy and no grant.
- Length and topic checks are enforced in the database as well as in the form.

3. Notes
- This data is intentionally public and shared between all visitors.
*/

CREATE TABLE IF NOT EXISTS real_world_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm text NOT NULL CHECK (algorithm IN ('scheduling', 'producerConsumer', 'bankers', 'memory')),
  author_name text NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 60),
  situation text NOT NULL CHECK (char_length(situation) BETWEEN 20 AND 600),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS real_world_examples_created_at_idx ON real_world_examples (created_at DESC);

ALTER TABLE real_world_examples ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON real_world_examples TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_real_world_examples" ON real_world_examples;
CREATE POLICY "anon_select_real_world_examples" ON real_world_examples FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_real_world_examples" ON real_world_examples;
CREATE POLICY "anon_insert_real_world_examples" ON real_world_examples FOR INSERT
  TO anon, authenticated WITH CHECK (true);
