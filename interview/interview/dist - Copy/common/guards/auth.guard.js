"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const bcryptjs_1 = __importDefault(require("../../../node_modules/bcryptjs/umd/index.js"));
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    moduleRef;
    sessionRepo;
    constructor(moduleRef) {
        super();
        this.moduleRef = moduleRef;
    }
    async canActivate(context) {
        try {
            const result = (await super.canActivate(context));
            if (!result)
                return false;
            if (!this.sessionRepo) {
                this.sessionRepo = this.moduleRef.get('SessionRepository', { strict: false });
                if (!this.sessionRepo) {
                    throw new common_1.UnauthorizedException('Session repository not available');
                }
            }
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            const authHeader = request.headers['authorization'];
            const token = authHeader?.split(' ')[1];
            if (!user || !token)
                throw new common_1.UnauthorizedException('Token missing');
            const sessions = await this.sessionRepo.find({
                where: { user: { id: user.sub }, isActive: true },
            });
            if (!sessions || sessions.length === 0) {
                throw new common_1.UnauthorizedException('Session expired');
            }
            let match = false;
            for (const s of sessions) {
                if (s.accessToken && (await bcryptjs_1.default.compare(token, s.accessToken))) {
                    match = true;
                    break;
                }
            }
            if (!match) {
                throw new common_1.UnauthorizedException('Token expired or invalid');
            }
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(error.message || 'Unauthorized');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], JwtAuthGuard);
//# sourceMappingURL=auth.guard.js.map