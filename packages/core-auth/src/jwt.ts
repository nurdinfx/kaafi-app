import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  phoneNumber: string;
  roles: string[];
}

export const generateTokens = (
  payload: TokenPayload,
  secret: string,
  accessExpiresIn: string = '7d',
  refreshSecret?: string,
  refreshExpiresIn: string = '30d'
): { accessToken: string; refreshToken?: string } => {
  const accessToken = jwt.sign(payload, secret, { expiresIn: accessExpiresIn } as jwt.SignOptions);
  let refreshToken: string | undefined;

  if (refreshSecret) {
    refreshToken = jwt.sign({ userId: payload.userId }, refreshSecret, { expiresIn: refreshExpiresIn } as jwt.SignOptions);
  }

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  return jwt.verify(token, secret) as TokenPayload;
};
