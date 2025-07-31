export interface ConsultaCpeComprobanteResponse {
  esExito: boolean;
  statusCode: number;
  nomArchivo: string;
  valArchivo: string; // Este es el base64 del ZIP
  errores: Error_ConsultaCpeComprobanteResponse[];
}

export interface Error_ConsultaCpeComprobanteResponse {
  status: string;
  message: string;
}
