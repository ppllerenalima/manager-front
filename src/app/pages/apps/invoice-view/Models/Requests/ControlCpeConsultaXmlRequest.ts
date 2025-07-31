export interface ControlCpeConsultaXmlRequest {
  rucEmisor: string; // RUC del emisor del comprobante
  tipoComprobante: string; // Tipo de comprobante (ej. 01=Factura)
  serie: string; // Serie del comprobante
  numero: number; // Número del comprobante
}
