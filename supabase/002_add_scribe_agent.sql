-- Add Scribe to agent_status table
INSERT INTO agent_status (id, agent_name, status, task, location, last_seen)
VALUES (gen_random_uuid(), 'Scribe', 'Idle', 'Awaiting data', 'Ingestion Desk', NOW())
ON CONFLICT (agent_name) DO NOTHING;
