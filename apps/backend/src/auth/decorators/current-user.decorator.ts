import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAccessPayload } from '../strategies/jwt.strategy';

/**
 * Параметрический декоратор, извлекающий `JwtAccessPayload` из `request.user`.
 * Заполняется `JwtStrategy.validate()` после успешной проверки Bearer-токена.
 *
 * @example
 * async me(@CurrentUser() user: JwtAccessPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtAccessPayload =>
    ctx.switchToHttp().getRequest<{ user: JwtAccessPayload }>().user,
);
