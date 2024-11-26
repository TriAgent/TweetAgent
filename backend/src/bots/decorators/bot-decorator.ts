import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ParamBot = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.bot;
  },
);