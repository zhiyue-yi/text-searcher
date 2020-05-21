import {
  validateDir,
  findAllFiles,
  searchKeywordFromFiles,
  printResults,
} from './utils';

async function search(dir: string, keyword: string) {
  validateDir(dir);

  const fileList = await findAllFiles(dir);

  console.log(`${fileList.length} files are queued for searching.`);
  console.log('Searching the keyword now...');

  const results = await searchKeywordFromFiles([...fileList], keyword);

  printResults(results, fileList);
}

export default search;
