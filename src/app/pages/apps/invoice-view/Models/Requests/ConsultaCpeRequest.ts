export interface ConsultaCpeRequest {
  clienteId: string;

  rucEmisor: string;
  tipoComprobante: string;
  serie: string;
  numero: number;
}
