CREATE TABLE IF NOT EXISTS operational_events (
    id UUID PRIMARY KEY,
    source_application VARCHAR(500) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    occurred_at TIMESTAMPTZ NOT NULL,
    trace_id VARCHAR(128) NOT NULL UNIQUE
);

