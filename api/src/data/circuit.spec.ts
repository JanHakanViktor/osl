import { describe, expect, it } from '@jest/globals';

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import CircuitLibrary from './circuit';

describe('CircuitLibrary', () => {
  it('references circuit images that exist in the client public assets', () => {
    const missingImages = CircuitLibrary.filter((circuit) => {
      const publicImagePath = circuit.image.replace(/^\//, '');
      const absoluteImagePath = join(
        process.cwd(),
        '..',
        'client',
        'public',
        publicImagePath,
      );

      return !existsSync(absoluteImagePath);
    }).map((circuit) => `${circuit.grandPrix}: ${circuit.image}`);

    expect(missingImages).toEqual([]);
  });
});
