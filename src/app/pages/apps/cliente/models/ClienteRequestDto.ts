export interface ClienteRequestDto {
  id?: string;
  isInactive: boolean;

  ruc: string;
  razonsocial: string;
  numero: string;
  direccion: string;
  image?: string | null;

  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  fechaRegistro: Date; // o string, si el backend envía texto ISO

  userId: string; // Guid en C# -> string en TS
  grupoId: string;
}
