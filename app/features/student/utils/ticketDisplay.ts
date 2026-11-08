import { TicketStatus } from "../../../types/ticket";

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const ticketStatusLabel = (status: TicketStatus): string =>
  STATUS_LABELS[status];

export const formatTicketDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatResolutionDays = (days: number | null): string => {
  if (days == null) return "—";
  if (days === 0) return "Same day";
  if (days === 1) return "1 day";
  return `${days} days`;
};

export const ticketStatusColors = (
  status: TicketStatus,
): { background: string; text: string } => {
  switch (status) {
    case "open":
      return { background: "rgba(245, 158, 11, 0.16)", text: "#B45309" };
    case "in_progress":
      return { background: "rgba(59, 130, 246, 0.16)", text: "#1D4ED8" };
    case "resolved":
      return { background: "rgba(16, 185, 129, 0.16)", text: "#047857" };
    case "closed":
      return { background: "rgba(100, 116, 139, 0.16)", text: "#475569" };
    default:
      return { background: "rgba(100, 116, 139, 0.16)", text: "#475569" };
  }
};
