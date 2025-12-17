import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import type { Request } from 'express';
import { SessionUser, UserCredentials } from 'src/auth/auth.types';

@Controller('users')
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Post('/register')
  async register(@Body() body: UserCredentials) {
    const user = await this.usersService.createUser(
      body.username,
      body.password,
    );

    return {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    };
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
}
