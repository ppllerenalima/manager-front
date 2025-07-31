export interface ConsultaCpeUnificadoResponse {
  esExito: boolean;
  statusCode: number;
  archivo?: string; // byte[] se mapea como Base64 en JSON
  nombreArchivo?: string;
  errores: ErrorConsultaCpeResponse[];
}

export interface ErrorConsultaCpeResponse {
  status: string;
  message: string;
}
