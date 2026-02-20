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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const typeorm_1 = require("typeorm");
const profile_entity_1 = require("../../profile/entity/profile.entity");
let Session = class Session {
    id;
    user;
    refreshToken;
    accessToken;
    isActive;
    userAgent;
    createdAt;
    updatedAt;
};
exports.Session = Session;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Session.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profile_entity_1.Profile, { onDelete: 'CASCADE' }),
    __metadata("design:type", profile_entity_1.Profile)
], Session.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], Session.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Session.prototype, "accessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Session.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Session.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Session.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Session.prototype, "updatedAt", void 0);
exports.Session = Session = __decorate([
    (0, typeorm_1.Entity)('session')
], Session);
//# sourceMappingURL=session.entity.js.map