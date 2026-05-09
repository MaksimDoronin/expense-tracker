export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface UserWithCredentials extends PublicUser {
  passwordHash: string;
}
