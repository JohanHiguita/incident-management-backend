export interface OpenIncidentItem {
  id: string;
  affectedApplication: string;
  severity: string;
  status: string;
  createdAt: string;
}

export type ListOpenIncidentsResponse = OpenIncidentItem[];
