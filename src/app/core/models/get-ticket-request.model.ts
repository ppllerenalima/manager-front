export interface GetTicketRequest {
  clienteId: string;
  codProceso?: string;
  perTributario: string;
  accessToken: string;
  page?: number;
  perPage?: number;
  numTicket?: string | null;
}
