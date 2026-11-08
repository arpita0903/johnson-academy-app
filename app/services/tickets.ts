import { AxiosError } from "axios";
import api from "./axiosInstance";
import {
  CreateTicketInput,
  TicketDetail,
  TicketListResponse,
} from "../types/ticket";

export const getTicketErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
};

export const listTickets = async (page = 1): Promise<TicketListResponse> => {
  const response = await api.get<TicketListResponse>("/tickets", {
    params: {
      page,
      limit: 20,
      sortBy: "createdAt:desc",
    },
  });
  return response.data;
};

export const getTicket = async (ticketId: string): Promise<TicketDetail> => {
  const response = await api.get<TicketDetail>(`/tickets/${ticketId}`);
  return response.data;
};

export const createTicket = async (
  input: CreateTicketInput,
): Promise<TicketDetail> => {
  const response = await api.post<TicketDetail>("/tickets", input);
  return response.data;
};
