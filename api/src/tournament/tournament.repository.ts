import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import type {
  TournamentState,
  TournamentStatus,
} from './domain/tournament.types';
import {
  toTournamentRecord,
  toTournamentState,
  type TournamentRecordWithId,
} from './mappers/tournament-record.mapper';
import { Tournament } from './schemas/tournament.schema';

const ACTIVE_HEAT_STATUSES: TournamentStatus[] = [
  'AWAITING_DRIVER',
  'HEAT_LIVE',
];
const LIST_LIMIT = 50;

@Injectable()
export class TournamentRepository {
  constructor(
    @InjectModel(Tournament.name)
    private readonly tournamentModel: Model<Tournament>,
  ) {}

  async create(state: TournamentState): Promise<TournamentState> {
    const created = await this.tournamentModel.create({
      _id: new Types.ObjectId(state.id),
      ...toTournamentRecord(state),
    });

    return toTournamentState(created.toObject() as TournamentRecordWithId);
  }

  async findById(id: string): Promise<TournamentState | null> {
    if (!isValidObjectId(id)) return null;

    const record = await this.tournamentModel
      .findById(id)
      .lean<TournamentRecordWithId>();

    return record ? toTournamentState(record) : null;
  }

  /** The tournament currently using the rig, if any. */
  async findWithActiveHeat(): Promise<TournamentState | null> {
    const record = await this.tournamentModel
      .findOne({ status: { $in: ACTIVE_HEAT_STATUSES } })
      .sort({ updatedAt: -1 })
      .lean<TournamentRecordWithId>();

    return record ? toTournamentState(record) : null;
  }

  async listForUser(userId: string): Promise<TournamentState[]> {
    const id = new Types.ObjectId(userId);
    const records = await this.tournamentModel
      .find({ $or: [{ hostUserId: id }, { 'drivers.userId': id }] })
      .sort({ createdAt: -1 })
      .limit(LIST_LIMIT)
      .lean<TournamentRecordWithId[]>();

    return records.map(toTournamentState);
  }

  async save(state: TournamentState): Promise<void> {
    await this.tournamentModel.replaceOne(
      { _id: new Types.ObjectId(state.id) },
      { ...toTournamentRecord(state), createdAt: state.createdAt },
    );
  }

  async countWinsByDriver(): Promise<Map<string, number>> {
    const rows = await this.tournamentModel.aggregate<{
      _id: Types.ObjectId;
      wins: number;
    }>([
      { $match: { status: 'FINISHED', winnerUserId: { $ne: null } } },
      { $group: { _id: '$winnerUserId', wins: { $sum: 1 } } },
    ]);

    return new Map(rows.map((row) => [row._id.toString(), row.wins]));
  }
}
