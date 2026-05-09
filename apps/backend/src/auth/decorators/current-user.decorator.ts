import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAccessPayload } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtAccessPayload =>
    ctx.switchToHttp().getRequest<{ user: JwtAccessPayload }>().user,
);
