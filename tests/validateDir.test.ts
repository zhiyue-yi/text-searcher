import * as fs from 'fs';
import { validateDir } from '../src/utils';

jest.mock('fs');
jest.mock('path');

describe('Utils - validateDir', () => {
  let spy: jest.SpyInstance<any>;

  beforeEach(() => {
    spy = jest.spyOn(fs, 'statSync');
  });

  afterEach(() => {
    spy.mockClear();
  });

  afterAll(() => {
    spy.mockRestore();
  });

  it('should pass if a directory exists', () => {
    spy.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const dir = 'test/dir';

    expect(() => validateDir(dir)).not.toThrowError();
  });

  it('should throw error if a directory does not exists', () => {
    spy.mockReturnValue({ isDirectory: () => false } as fs.Stats);

    const dir = 'test/dir';

    expect(() => validateDir(dir)).toThrowError(
      'The path is not a directory: test/dir',
    );
  });
});
