export interface CreateIncidentFromEventsResponse {
    id: string;
    title: string;
    status: string;
    affectedApplication: string;
    linkedEventIds: string[];
  }