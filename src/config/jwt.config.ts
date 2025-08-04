import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_KEY,
  updateTokenSecret: process.env.JWT_UPDATE_TOKEN_KEY,
}));
