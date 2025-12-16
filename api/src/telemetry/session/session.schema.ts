import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'session' })
export class Session extends Document {
  @Prop()
  hello: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
