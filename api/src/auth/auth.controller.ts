import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SessionUser, UserCredentials } from 'src/auth/auth.types';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoginDto } from 'src/auth/signIn.dto';

@Controller('users')
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Post('/register')
  async register(@Req() req: Request, @Body() body: UserCredentials) {
    const user = await this.usersService.createUser(
      body.username,
      body.password,
      body.drivername,
    );

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      username: user.username,
      drivername: user.drivername || user.username,
      isAdmin: user.isAdmin,
    };

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

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      username: user.username,
      drivername: user.drivername || user.username,
      isAdmin: user.isAdmin,
    };

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
      return {
        ...sessionUser,
        drivername: sessionUser.drivername || sessionUser.username,
      };
    }

    const currentUser: SessionUser = {
      id: user._id.toString(),
      username: user.username,
      drivername: user.drivername || user.username,
      isAdmin: user.isAdmin,
    };

    req.session!.user = currentUser;
    return currentUser;
  }
}
