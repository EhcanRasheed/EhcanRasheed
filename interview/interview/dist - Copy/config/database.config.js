"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'amnazia1122',
    database: process.env.DB_NAME || 'interview',
}));
//# sourceMappingURL=database.config.js.map