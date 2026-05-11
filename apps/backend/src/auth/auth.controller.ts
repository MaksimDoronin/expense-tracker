import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtAccessPayload } from './strategies/jwt.strategy';

/** REST-контроллер аутентификации. Публичные маршруты: register, login. Защищённый: me. */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * @param dto - Имя, email и пароль нового пользователя.
   * @returns `AuthResult` с данными пользователя и `accessToken`. HTTP-статусы — см. `@ApiResponse`.
   */
  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан, возвращает user и accessToken.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует.' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.name, dto.email, dto.password);
  }

  /**
   * @param dto - Email и пароль существующего пользователя.
   * @returns `AuthResult` с данными пользователя и `accessToken`. HTTP-статусы — см. `@ApiResponse`.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 200, description: 'Успешный вход, возвращает user и accessToken.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Неверный email или пароль.' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  /**
   * @param user - JWT-payload аутентифицированного пользователя (`sub` = userId).
   * @returns `PublicUser` текущего пользователя. HTTP-статусы — см. `@ApiResponse`.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Данные текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Возвращает PublicUser (id, name, email).' })
  @ApiResponse({ status: 401, description: 'Токен отсутствует, истёк или пользователь не найден.' })
  me(@CurrentUser() user: JwtAccessPayload) {
    return this.auth.getMe(user.sub);
  }
}
