import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'session' })
export class Session extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  sessionName: string;

  @Prop({ required: true })
  circuitId: number;

  @Prop({ required: true })
  circuitName: string;

  @Prop({ default: 'CREATED' })
  status: 'CREATED' | 'ACTIVE' | 'FINISHED';

  @Prop({ enum: ['TIME', 'LAPS'], required: true })
  limitType: 'TIME' | 'LAPS';

  @Prop()
  timeLimitSeconds?: number;

  @Prop()
  lapLimit?: number;

  @Prop({ default: 0 })
  fastestLapMs?: number;

  @Prop({ default: 0 })
  topSpeedKmh: number;

  @Prop()
  startedAt?: Date;

  @Prop()
  finishedAt?: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
