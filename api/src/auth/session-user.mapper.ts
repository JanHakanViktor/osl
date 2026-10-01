import type { Types } from 'mongoose';
import type { SessionUser } from 'src/auth/auth.types';
import type { User } from 'src/users/user.schema';

type SessionUserSource = Pick<
  User,
  'username' | 'drivername' | 'isAdmin' | 'country' | 'teamId'
> & { _id: Types.ObjectId };

export function toSessionUser(user: SessionUserSource): SessionUser {
  return {
    id: user._id.toString(),
    username: user.username,
    drivername: user.drivername || user.username,
    isAdmin: user.isAdmin,
    country: user.country ?? null,
    teamId: user.teamId ?? null,
  };
}
