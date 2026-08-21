import { Injectable } from '@nestjs/common';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  mapRaceNetReference,
  type DefaultReferenceLap,
} from './race-net-reference.mapper';
import type { RaceNetReferencePayload } from './race-net-reference.types';
import { assertRaceNetReference } from './race-net-reference.validator';

const DATA_DIRECTORY = join(__dirname, 'data');

@Injectable()
export class DefaultReferenceLapRepository {
  private readonly referencesByCircuitId: ReadonlyMap<
    number,
    DefaultReferenceLap
  >;

  constructor() {
    const references = readdirSync(DATA_DIRECTORY)
      .filter((fileName) => fileName.endsWith('.json'))
      .map((fileName) => this.readReference(fileName))
      .sort((left, right) => left.circuitId - right.circuitId);

    this.referencesByCircuitId = new Map(
      references.map((reference) => [reference.circuitId, reference]),
    );
  }

  getAll(): DefaultReferenceLap[] {
    return [...this.referencesByCircuitId.values()];
  }

  findByCircuitId(circuitId: number): DefaultReferenceLap | undefined {
    return this.referencesByCircuitId.get(circuitId);
  }

  private readReference(fileName: string): DefaultReferenceLap {
    const raw = readFileSync(join(DATA_DIRECTORY, fileName), 'utf8');
    const payload = JSON.parse(raw) as RaceNetReferencePayload;
    assertRaceNetReference(payload);
    return mapRaceNetReference(payload);
  }
}
