import { registerAs } from '@nestjs/config';
export default registerAs('jwt', () => ({
secret: process.env.JWT_SECRET || 'change_this_dev_secret',
expiresIn: process.env.JWT_EXPIRES || '1h',
refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_this_refresh_secret',
refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
}));