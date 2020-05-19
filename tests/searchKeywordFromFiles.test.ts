import { searchKeywordFromFiles } from '../src/utils';

describe('Utils - searchKeywordFromFiles', () => {
  it('should search correct keywords from the sample folder', async () => {
    const fileList = [
      'tests/sample/sample-code-1.js',
      'tests/sample/sample-folder/sample-code-2.js',
      'tests/sample/sample-folder/sample-code-3.js',
    ];
    const keyword = 'TODO';

    expect(await searchKeywordFromFiles(fileList, keyword)).toEqual([
      { file: 'tests/sample/sample-code-1.js', line: 5 },
      { file: 'tests/sample/sample-code-1.js', line: 8 },
      { file: 'tests/sample/sample-folder/sample-code-2.js', line: 3 },
    ]);
  });
});
