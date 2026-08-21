import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class SimCoachWorldPosition {
  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;

  @Prop({ required: true })
  z: number;
}

export const SimCoachWorldPositionSchema = SchemaFactory.createForClass(
  SimCoachWorldPosition,
);

@Schema({ _id: false })
export class SimCoachSample {
  @Prop({ required: true })
  distanceM: number;

  @Prop({ required: true })
  elapsedMs: number;

  @Prop({ required: true })
  speedKmh: number;

  @Prop({ required: true })
  throttle: number;

  @Prop({ required: true })
  brake: number;

  @Prop({ required: true })
  steer: number;

  @Prop({ required: true })
  gear: number;

  @Prop({ required: true })
  engineRpm: number;

  @Prop({ type: SimCoachWorldPositionSchema })
  position?: SimCoachWorldPosition;

  @Prop()
  yawRad?: number;
}

export const SimCoachSampleSchema =
  SchemaFactory.createForClass(SimCoachSample);

@Schema({ collection: 'simCoachLaps', timestamps: true })
export class SimCoachLap extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Session', index: true })
  sessionId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  sourceLapId: string;

  @Prop({ required: true })
  sourceSessionUid: string;

  @Prop({ required: true, index: true })
  circuitId: number;

  @Prop({ required: true })
  sourceTrackId: number;

  @Prop({ required: true })
  sessionType: number;

  @Prop({ required: true })
  trackLengthM: number;

  @Prop({ required: true })
  playerCarIndex: number;

  @Prop({ required: true })
  lapNumber: number;

  @Prop({ required: true })
  lapTimeMs: number;

  @Prop({ required: true })
  valid: boolean;

  @Prop({ required: true })
  capturedAt: Date;

  @Prop({ required: true, type: [SimCoachSampleSchema] })
  samples: SimCoachSample[];

  @Prop({ type: Types.ObjectId, ref: SimCoachLap.name })
  referenceLapId?: Types.ObjectId;
}

export const SimCoachLapSchema = SchemaFactory.createForClass(SimCoachLap);

SimCoachLapSchema.index({ userId: 1, circuitId: 1, valid: 1, lapTimeMs: 1 });
SimCoachLapSchema.index({ sessionId: 1, lapNumber: 1 });
