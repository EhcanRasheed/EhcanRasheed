import { ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private moduleRef;
    private sessionRepo;
    constructor(moduleRef: ModuleRef);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};
