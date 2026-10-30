import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { TimingBoardSnapshot } from './domain/timing.types';
import {
  toTimingBoardSnapshot,
  toTimingSessionRecord,
} from './mappers/timing-session-record.mapper';
import { TimingSession } from './schemas/timing-session.schema';

const LIST_LIMIT = 25;

@Injectable()
export class TimingSessionRepository {
  constructor(
    @InjectModel(TimingSession.name)
    private readonly timingSessionModel: Model<TimingSession>,
  ) {}

  async findBySessionUid(
    sessionUid: string,
  ): Promise<TimingBoardSnapshot | null> {
    const record = await this.timingSessionModel
      .findOne({ sessionUid })
      .lean<TimingSession>();

    return record ? toTimingBoardSnapshot(record) : null;
  }

  async listRecent(): Promise<TimingBoardSnapshot[]> {
    const records = await this.timingSessionModel
      .find()
      .sort({ updatedAt: -1 })
      .limit(LIST_LIMIT)
      .lean<TimingSession[]>();

    return records.map(toTimingBoardSnapshot);
  }

  async save(snapshot: TimingBoardSnapshot): Promise<void> {
    await this.timingSessionModel.replaceOne(
      { sessionUid: snapshot.sessionUid },
      toTimingSessionRecord(snapshot),
      { upsert: true },
    );
  }
}
