export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketActivityType =
  | "created"
  | "assigned"
  | "reassigned"
  | "unassigned"
  | "status_changed"
  | "comment";

export interface TicketUser {
  id: string;
  name: string;
  role?: string;
  rollNumber?: string;
}

export interface TicketActivity {
  type: TicketActivityType;
  at: string;
  actor: TicketUser | null;
  fromStatus?: TicketStatus;
  toStatus?: TicketStatus;
  fromAssignee?: TicketUser | null;
  toAssignee?: TicketUser | null;
  body?: string;
}

export interface TicketListItem {
  id: string;
  ticketNumber: number;
  displayId: string;
  subject: string;
  status: TicketStatus;
  student: TicketUser;
  assignee: TicketUser | null;
  createdAt: string;
  firstAssignedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  resolutionDays: number | null;
}

export interface TicketDetail extends TicketListItem {
  description: string;
  activities: TicketActivity[];
}

export interface TicketListResponse {
  results: TicketListItem[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface CreateTicketInput {
  subject: string;
  description: string;
}
