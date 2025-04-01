export interface AdapterUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface AuthToken {
  id: string;
  sub: string;
  [key: string]: unknown;
}
