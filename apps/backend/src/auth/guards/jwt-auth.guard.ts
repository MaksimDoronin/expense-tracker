import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для защиты маршрутов через JWT Bearer-токен.
 * При успехе кладёт `JwtAccessPayload` в `request.user`.
 * Используется совместно с `@CurrentUser()` для получения данных аутентифицированного пользователя.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
