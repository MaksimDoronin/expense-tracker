import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/** Данные, закодированные в JWT-токене доступа. */
export interface JwtAccessPayload {
  /** UUID пользователя (стандартное поле subject). */
  sub: string;
  email: string;
}

/**
 * Passport-стратегия для валидации JWT Bearer-токена.
 * Секрет считывается из `JWT_SECRET`; при его отсутствии приложение не запустится.
 * После успешной валидации возвращает `JwtAccessPayload`, который Passport кладёт в `request.user`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Вызывается Passport после успешной верификации подписи токена.
   *
   * @param payload - Декодированный payload токена.
   * @returns Тот же payload — становится `request.user`.
   */
  validate(payload: JwtAccessPayload): JwtAccessPayload {
    return { sub: payload.sub, email: payload.email };
  }
}
