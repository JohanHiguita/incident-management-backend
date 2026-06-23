export interface CreateIncidentFromEventsRequest {
    title: string;
    description: string;
    affectedApplication: string;
    severity: string;
    assignee: string;
    eventIds: string[];
  }