import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentHiringUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
