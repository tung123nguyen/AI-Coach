-- Coach logs: each entry = one Coach intervention on a User message.
-- One User message can have at most one coach log (1:0..1).

CREATE TABLE IF NOT EXISTS coach_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  message_id UUID NOT NULL UNIQUE REFERENCES messages(id) ON DELETE CASCADE,
  severity INT NOT NULL CHECK (severity BETWEEN 1 AND 3),
  issue TEXT NOT NULL,
  suggestions JSONB NOT NULL,         -- string[] of alternative phrasings
  explanation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_logs_session_id ON coach_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_coach_logs_message_id ON coach_logs(message_id);

ALTER TABLE coach_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own coach logs" ON coach_logs FOR SELECT USING (
  session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
);
