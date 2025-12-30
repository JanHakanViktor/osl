import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'session' })
export class Session extends Document {
  // USER
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  sessionName: string;

  // SESSION SETTINGS
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

  @Prop()
  startedAt?: Date;

  @Prop()
  finishedAt?: Date;

  // TELEMETRY
  @Prop({
    type: {
      fastestLapMs: { type: Number, default: 0 },
      topSpeedKmh: { type: Number, default: 0 },
      cleanLapStreak: { type: Number, default: 0 },
      bestCleanLapStreak: { type: Number, default: 0 },
      totalCleanLaps: { type: Number, default: 0 },
    },
    default: () => ({}),
  })
  telemetry: {
    fastestLapMs: number;
    topSpeedKmh: number;
    cleanLapStreak: number;
    bestCleanLapStreak: number;
    totalCleanLaps: number;
  };
}

export const SessionSchema = SchemaFactory.createForClass(Session);
