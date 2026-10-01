import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SessionUser } from 'src/auth/auth.types';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoginDto } from 'src/auth/signIn.dto';
import { RegisterUserDto } from 'src/auth/register-user.dto';
import { toSessionUser } from 'src/auth/session-user.mapper';

@Controller('users')
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Post('/register')
  async register(
    @Req() req: Request,
    @Body() body: RegisterUserDto,
  ): Promise<SessionUser> {
    const user = await this.usersService.createUser(body);
    const sessionUser = toSessionUser(user);

    if (!req.session) {
      req.session = {};
    }
    req.session.user = sessionUser;

    return sessionUser;
  }

  @Post('/login')
  async login(
    @Req() req: Request,
    @Body() body: LoginDto,
  ): Promise<SessionUser> {
    const user = await this.usersService.checkUser(
      body.username,
      body.password,
    );
    const sessionUser = toSessionUser(user);

    if (!req.session) {
      req.session = {};
    }
    req.session.user = sessionUser;

    return sessionUser;
  }

  @Post('logout')
  logout(@Req() req: Request) {
    req.session = null;
    return { success: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request): Promise<SessionUser> {
    const sessionUser = req.session!.user!;
    const user = await this.usersService.findSessionUser(sessionUser.id);

    if (!user) {
      // Cookies issued before country/team existed do not carry them.
      return {
        ...sessionUser,
        drivername: sessionUser.drivername || sessionUser.username,
        country: sessionUser.country ?? null,
        teamId: sessionUser.teamId ?? null,
      };
    }

    const currentUser = toSessionUser(user);

    req.session!.user = currentUser;
    return currentUser;
  }
}
