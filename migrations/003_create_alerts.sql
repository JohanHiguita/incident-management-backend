-- context: alerts (HU3)

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY,
    source_event_id UUID NOT NULL REFERENCES operational_events(id),
    affected_application VARCHAR(500) NOT NULL,
    severity VARCHAR(20) NOT NULL
        CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    generated_at TIMESTAMPTZ NOT NULL,
    processing_status VARCHAR(20) NOT NULL
        CHECK (processing_status IN ('PENDING', 'PROCESSED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_alerts_source_event_id
    ON alerts(source_event_id);
