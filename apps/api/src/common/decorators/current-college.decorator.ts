import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentCollege = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.collegeId;
  },
);
