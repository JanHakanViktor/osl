import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type {
  DriverStatus,
  PitStatus,
  ResultStatus,
  SafetyCarStatus,
  SessionKind,
  TrackWeather,
  TyreCompound,
} from '../domain/timing.types';

@Schema({ _id: false })
export class TimingSessionInfoRecord {
  @Prop({ type: String, required: true })
  sessionKind: SessionKind;

  @Prop({ required: true })
  sessionName: string;

  @Prop({ type: Number, default: null })
  f1TrackId: number | null;

  @Prop({ type: Number, default: null })
  trackLengthM: number | null;

  @Prop({ type: Number, default: null })
  totalLaps: number | null;

  @Prop({ type: String, default: null })
  weather: TrackWeather | null;

  @Prop({ default: 0 })
  trackTemperatureC: number;

  @Prop({ default: 0 })
  airTemperatureC: number;

  @Prop({ type: String, default: 'NONE' })
  safetyCar: SafetyCarStatus;

  @Prop({ default: false })
  isOnline: boolean;
}

const TimingSessionInfoRecordSchema = SchemaFactory.createForClass(
  TimingSessionInfoRecord,
);

@Schema({ _id: false })
export class TimingDriverRecord {
  @Prop({ default: '' })
  name: string;

  @Prop({ type: Number, default: null })
  raceNumber: number | null;

  @Prop({ type: String, default: null })
  teamId: string | null;

  @Prop({ type: String, default: null })
  teamName: string | null;

  @Prop({ default: false })
  isAi: boolean;
}

const TimingDriverRecordSchema =
  SchemaFactory.createForClass(TimingDriverRecord);

/** The car's last live state, kept for the stats it carries. */
@Schema({ _id: false })
export class CarLiveStateRecord {
  @Prop({ default: 0 })
  position: number;

  @Prop({ default: 0 })
  lapNumber: number;

  @Prop({ default: 0 })
  lapDistanceM: number;

  @Prop({ default: 0 })
  currentLapTimeMs: number;

  @Prop({ default: false })
  currentLapInvalid: boolean;

  @Prop({ type: Number, default: 1 })
  sector: 1 | 2 | 3;

  @Prop({ type: String, default: 'NONE' })
  pitStatus: PitStatus;

  @Prop({ type: String, default: 'ON_TRACK' })
  driverStatus: DriverStatus;

  @Prop({ type: String, required: true })
  resultStatus: ResultStatus;

  @Prop({ default: 0 })
  gapToLeaderMs: number;

  @Prop({ default: 0 })
  intervalMs: number;

  @Prop({ type: Number, default: null })
  gridPosition: number | null;

  @Prop({ default: 0 })
  pitStops: number;

  @Prop({ default: 0 })
  penaltiesSeconds: number;

  @Prop({ default: 0 })
  warnings: number;

  @Prop({ default: 0 })
  cornerCuttingWarnings: number;

  @Prop({ type: Number, default: null })
  speedTrapKmh: number | null;
}

const CarLiveStateRecordSchema =
  SchemaFactory.createForClass(CarLiveStateRecord);

@Schema({ _id: false })
export class TimingLapRecord {
  @Prop({ required: true })
  lapNumber: number;

  @Prop({ required: true })
  lapTimeMs: number;

  @Prop({ type: [Number], default: [] })
  sectorsMs: Array<number | null>;

  @Prop({ required: true })
  valid: boolean;

  @Prop({ type: [Boolean], default: [] })
  sectorsValid: boolean[];
}

const TimingLapRecordSchema = SchemaFactory.createForClass(TimingLapRecord);

@Schema({ _id: false })
export class TyreStintRecord {
  @Prop({ type: String, default: null })
  compound: TyreCompound | null;

  @Prop({ type: Number, default: null })
  endLap: number | null;
}

const TyreStintRecordSchema = SchemaFactory.createForClass(TyreStintRecord);

@Schema({ _id: false })
export class FinalResultRecord {
  @Prop({ required: true })
  position: number;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 0 })
  lapsCompleted: number;

  @Prop({ type: Number, default: null })
  gridPosition: number | null;

  @Prop({ default: 0 })
  pitStops: number;

  @Prop({ type: String, required: true })
  resultStatus: ResultStatus;

  @Prop({ type: Number, default: null })
  bestLapMs: number | null;

  @Prop({ type: Number, default: null })
  totalRaceTimeMs: number | null;

  @Prop({ default: 0 })
  penaltiesSeconds: number;
}

const FinalResultRecordSchema = SchemaFactory.createForClass(FinalResultRecord);

@Schema({ _id: false })
export class TimingCarRecord {
  @Prop({ required: true })
  carIndex: number;

  @Prop({ type: TimingDriverRecordSchema, default: null })
  driver: TimingDriverRecord | null;

  @Prop({ type: CarLiveStateRecordSchema, default: null })
  live: CarLiveStateRecord | null;

  @Prop({ type: [TimingLapRecordSchema], default: [] })
  laps: TimingLapRecord[];

  @Prop({ type: [TyreStintRecordSchema], default: [] })
  tyreStints: TyreStintRecord[];

  @Prop({ type: FinalResultRecordSchema, default: null })
  result: FinalResultRecord | null;
}

const TimingCarRecordSchema = SchemaFactory.createForClass(TimingCarRecord);

/** A game session's timing for every car, saved while it runs. */
@Schema({ collection: 'timing_sessions' })
export class TimingSession {
  @Prop({ required: true, unique: true })
  sessionUid: string;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ required: true, index: true })
  updatedAt: Date;

  @Prop({ type: TimingSessionInfoRecordSchema, default: null })
  session: TimingSessionInfoRecord | null;

  @Prop({ type: Number, default: null })
  playerCarIndex: number | null;

  @Prop({ type: [TimingCarRecordSchema], default: [] })
  cars: TimingCarRecord[];
}

export const TimingSessionSchema = SchemaFactory.createForClass(TimingSession);
