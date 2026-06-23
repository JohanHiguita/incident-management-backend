-- Performance indexes for dashboard aggregations, repository lookups and HU5 open incidents.

-- operational_events (HU1 + HU4)
-- trace_id already has a UNIQUE constraint (implicit index).
CREATE INDEX IF NOT EXISTS idx_operational_events_occurred_at
    ON operational_events (occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_operational_events_source_application_occurred_at
    ON operational_events (source_application, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_operational_events_severity_occurred_at
    ON operational_events (severity, occurred_at DESC);

-- incidents (HU2 + HU4 + HU5)
CREATE INDEX IF NOT EXISTS idx_incidents_status_created_at
    ON incidents (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_affected_application_created_at
    ON incidents (affected_application, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_severity_created_at
    ON incidents (severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_open_created_at
    ON incidents (created_at DESC)
    WHERE status IN ('OPEN', 'IN_PROGRESS');

-- incident_events (HU2): PK covers incident_id; event_id for reverse lookups
CREATE INDEX IF NOT EXISTS idx_incident_events_event_id
    ON incident_events (event_id);

-- alerts (HU3 + HU4)
-- source_event_id already indexed in 003_create_alerts.sql
CREATE INDEX IF NOT EXISTS idx_alerts_generated_at
    ON alerts (generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_affected_application_generated_at
    ON alerts (affected_application, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_severity_generated_at
    ON alerts (severity, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_pending
    ON alerts (generated_at DESC)
    WHERE processing_status = 'PENDING';
