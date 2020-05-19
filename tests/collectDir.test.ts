import * as fs from 'fs';
import { collectDirs } from '../src/utils';

jest.mock('fs');

describe('Utils - collectDirs', () => {
  let spy: jest.SpyInstance<any>;

  beforeEach(() => {
    spy = jest.spyOn(fs, 'readdirSync');
    spy.mockReturnValue(['folder', 'file.js']);
  });

  afterEach(() => {
    spy.mockClear();
  });

  afterAll(() => {
    spy.mockRestore();
  });

  it('should append input directory to all its child directories', async () => {
    const subDirectories = collectDirs('/parent');
    expect(subDirectories).toEqual(['/parent/folder', '/parent/file.js']);
  });
});
