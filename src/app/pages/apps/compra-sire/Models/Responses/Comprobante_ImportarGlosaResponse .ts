export interface Comprobante_ImportarGlosaResponse {
  totalProcesados: number;
  exitosos: number;
  fallidos: number;
  detalle: Comprobante_GlosaResponse[];
}

export interface Comprobante_GlosaResponse {
  id: string;
  serie: string;
  numero: string;
  glosa: string;
  exito: boolean;
  mensaje: string;
  nombreArchivo?: string;
}
