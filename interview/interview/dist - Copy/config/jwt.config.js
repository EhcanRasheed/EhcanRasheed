"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'change_this_dev_secret',
    expiresIn: process.env.JWT_EXPIRES || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_this_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
}));
//# sourceMappingURL=jwt.config.js.map