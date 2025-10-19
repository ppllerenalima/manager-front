import { ClienteRequestDto } from "./ClienteRequestDto";

export interface ClienteDialogData {
  id: string | null;
  cliente: ClienteRequestDto | null;
}
