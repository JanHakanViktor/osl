import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop()
  drivername?: string;

  @Prop({ required: true, minLength: 6 })
  password: string;

  @Prop({ default: false })
  isAdmin: boolean;

  /** ISO 3166-1 alpha-2 code. Missing for users who signed up before it existed. */
  @Prop()
  country?: string;

  /** Team id from src/data/team.ts. Missing for users who signed up before it existed. */
  @Prop()
  teamId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
