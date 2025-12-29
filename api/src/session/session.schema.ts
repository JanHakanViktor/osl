import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'session' })
export class Session extends Document {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  sessionName: string;

  @Prop({ required: true })
  circuitId: number;

  @Prop()
  circuitName: string;

  @Prop({ enum: ['TIME', 'LAPS'], required: true })
  limitType: 'TIME' | 'LAPS';

  @Prop()
  timeLimitSeconds?: number;

  @Prop()
  lapLimit?: number;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
