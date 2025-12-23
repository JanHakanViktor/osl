import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SessionUser, UserCredentials } from 'src/auth/auth.types';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Post('/register')
  async register(@Req() req: Request, @Body() body: UserCredentials) {
    const user = await this.usersService.createUser(
      body.username,
      body.password,
    );

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      username: user.username,
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
    @Body() body: UserCredentials,
  ): Promise<SessionUser> {
    const user = await this.usersService.checkUser(
      body.username,
      body.password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      username: user.username,
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
  me(@Req() req: Request): SessionUser {
    return req.session!.user!;
  }
}
