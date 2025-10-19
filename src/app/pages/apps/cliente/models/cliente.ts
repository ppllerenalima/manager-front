export interface Cliente {
  id?: string;
 
  ruc: string;
  razonsocial: string;
  numero: string;
  direccion: string;
  image: string;
 
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;

  userId?: string | null;
  grupoId?: string | null;

  grupo: string;
}
