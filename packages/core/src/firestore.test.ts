import { describe, expect, it } from 'vitest';
import { stripUndefined } from './firestore.js';

describe('stripUndefined', () => {
  it('removes undefined keys at all depths', () => {
    const input = {
      a: 1,
      b: undefined,
      nested: { c: 'ok', d: undefined },
      list: [{ e: 1, f: undefined }],
    };

    expect(stripUndefined(input)).toEqual({
      a: 1,
      nested: { c: 'ok' },
      list: [{ e: 1 }],
    });
  });
});
