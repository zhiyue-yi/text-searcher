import * as fs from 'fs';
import * as path from 'path';
import { findAllFiles } from '../src/utils';

jest.mock('fs');
jest.mock('path');

describe('Utils - findAllFiles - with mock functions', () => {
  let spyStatSync: jest.SpyInstance<any>;
  let spyJoin: jest.SpyInstance<any>;
  let spyReaddirSync: jest.SpyInstance<any>;

  beforeEach(() => {
    spyStatSync = jest.spyOn(fs, 'statSync');
    spyStatSync.mockImplementation((dir) => {
      const result = dir === '/parent' || dir === '/parent/folder';
      return { isDirectory: () => result };
    });

    spyJoin = jest.spyOn(path, 'join');
    spyJoin.mockReturnValue('/parent');

    spyReaddirSync = jest.spyOn(fs, 'readdirSync');
    spyReaddirSync.mockImplementation((dir) => {
      if (dir === '/parent') {
        return ['folder', 'file.js'];
      }

      if (dir === '/parent/folder') {
        return ['inner-file.js'];
      }

      return [];
    });
  });

  afterEach(() => {
    spyStatSync.mockClear();
    spyJoin.mockClear();
    spyReaddirSync.mockClear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should find all the files from a given directory', async () => {
    const fileList = await findAllFiles('/parent');
    expect(fileList).toEqual([
      '/parent/file.js',
      '/parent/folder/inner-file.js',
    ]);
  });
});
