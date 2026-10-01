import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { RULE_SET_IDS, type RuleSetId } from '../domain/rule-sets';
import {
  TOURNAMENT_WEATHER,
  type ActiveHeatStatus,
  type HeatEndReason,
  type TournamentStatus,
  type TournamentWeather,
} from '../domain/tournament.types';

@Schema({ _id: false })
export class HeatLapRecord {
  @Prop({ required: true })
  gameSessionUid: string;

  @Prop({ required: true })
  lapNumber: number;

  @Prop({ required: true })
  lapTimeMs: number;

  @Prop({ type: [Number], default: [] })
  sectorsMs: number[];

  @Prop({ required: true })
  valid: boolean;
}

const HeatLapRecordSchema = SchemaFactory.createForClass(HeatLapRecord);

@Schema({ _id: false })
export class CompletedHeatRecord {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driverUserId: Types.ObjectId;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ required: true })
  finishedAt: Date;

  @Prop({
    type: String,
    enum: ['LAP_TARGET_REACHED', 'ENDED_BY_HOST'],
    required: true,
  })
  endReason: HeatEndReason;

  @Prop({ type: [HeatLapRecordSchema], default: [] })
  laps: HeatLapRecord[];

  @Prop({ default: 0 })
  topSpeedKmh: number;
}

const CompletedHeatRecordSchema =
  SchemaFactory.createForClass(CompletedHeatRecord);

@Schema({ _id: false })
export class RoundRecord {
  @Prop({ required: true })
  circuitId: number;

  @Prop({ type: [CompletedHeatRecordSchema], default: [] })
  heats: CompletedHeatRecord[];
}

const RoundRecordSchema = SchemaFactory.createForClass(RoundRecord);

@Schema({ _id: false })
export class ActiveHeatRecord {
  @Prop({ required: true })
  roundIndex: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driverUserId: Types.ObjectId;

  @Prop({ type: String, enum: ['STAGED', 'LIVE'], required: true })
  status: ActiveHeatStatus;

  @Prop({ required: true })
  stagedAt: Date;

  @Prop({ type: String, default: null })
  stagedGameSessionUid: string | null;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: String, default: null })
  gameSessionUid: string | null;

  @Prop({ type: [HeatLapRecordSchema], default: [] })
  laps: HeatLapRecord[];

  @Prop({ default: 0 })
  topSpeedKmh: number;

  @Prop({ type: Number, default: null })
  detectedCircuitId: number | null;
}

const ActiveHeatRecordSchema = SchemaFactory.createForClass(ActiveHeatRecord);

@Schema({ _id: false })
export class TournamentDriverRecord {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  driverName: string;

  /** Missing on tournaments created before drivers had a flag. */
  @Prop({ type: String, default: null })
  country?: string | null;

  /** Missing on tournaments created before drivers had a team. */
  @Prop({ type: String, default: null })
  teamId?: string | null;
}

const TournamentDriverRecordSchema = SchemaFactory.createForClass(
  TournamentDriverRecord,
);

@Schema({ collection: 'tournaments', timestamps: true })
export class Tournament {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  hostUserId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: TOURNAMENT_WEATHER, required: true })
  weather: TournamentWeather;

  @Prop({ required: true, min: 1 })
  lapsPerDriver: number;

  @Prop({ default: false })
  cleanLapBonus: boolean;

  @Prop({ default: false })
  topSpeedBonus: boolean;

  @Prop({ type: String, enum: RULE_SET_IDS, required: true })
  ruleSetId: RuleSetId;

  @Prop({ type: [TournamentDriverRecordSchema], required: true })
  drivers: TournamentDriverRecord[];

  @Prop({ type: [RoundRecordSchema], required: true })
  rounds: RoundRecord[];

  @Prop({ type: ActiveHeatRecordSchema, default: null })
  activeHeat: ActiveHeatRecord | null;

  @Prop({
    type: String,
    enum: ['READY', 'AWAITING_DRIVER', 'HEAT_LIVE', 'FINISHED'],
    required: true,
    index: true,
  })
  status: TournamentStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  winnerUserId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  finishedAt: Date | null;

  createdAt: Date;
}

export type TournamentDocument = HydratedDocument<Tournament>;

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
TournamentSchema.index({ 'drivers.userId': 1 });
TournamentSchema.index({ updatedAt: -1 });
