export type JWTCreatePayload = {
  id: number;
  email: string;
};

export type JWTUpdatePayload = JWTCreatePayload & { refreshToken: string };

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};
