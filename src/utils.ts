import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { MAX_OPEN_FILE_COUNT } from './constants';

/**
 * Validate a directory by checking its existance
 * @param dir Directory to validate
 */
export function validateDir(dir: string) {
  const pathInfo = fs.statSync(dir);

  if (!pathInfo.isDirectory()) {
    throw Error(`The path is not a directory: ${dir}`);
  }
}

/**
 * Find all the files under the directory and its sub-directories
 * @param dir The directory to search
 */
export async function findAllFiles(dir: string) {
  // Find all the files
  const directory = path.join(process.cwd(), dir);

  const dirQueue: string[] = [directory];
  const fileList: string[] = [];

  do {
    const currentDir = dirQueue.pop();

    const isDirectory = fs.statSync(currentDir).isDirectory();

    if (isDirectory) {
      console.log(`File queued: ${currentDir}`);
      const subDirs = collectDirs(currentDir);
      dirQueue.push(...subDirs);
    } else {
      fileList.push(currentDir);
    }
  } while (dirQueue.length);

  return fileList;
}

/**
 * Collect paths for a given directory's sub-directory and files
 * @param dir
 */
export function collectDirs(dir: string) {
  const files = fs.readdirSync(dir).map((file) => `${dir}/${file}`);
  return files;
}

/**
 * Search keywords from the contents of files stated in the list
 * @param fileList The list of files to search
 * @param keyword The keyword to search
 */
export async function searchKeywordFromFiles(
  fileList: string[],
  keyword: string,
) {
  const results: string[] = [];
  const openedFilesMap = {};
  const tasks: Promise<unknown>[] = [];

  while (fileList.length) {
    if (Object.keys(openedFilesMap).length < MAX_OPEN_FILE_COUNT) {
      const task = processFile(
        fileList.pop(),
        keyword,
        openedFilesMap,
        results,
      );

      tasks.push(task);
    } else {
      await Promise.all(tasks);
    }
  }

  await Promise.all(tasks);

  return results;
}

/**
 * Process individual file by searching the keyword one by one
 * @param file
 * @param keyword
 * @param openedFilesMap
 * @param results
 */
export function processFile(
  file: string,
  keyword: string,
  openedFilesMap: {},
  results: string[],
) {
  const task = new Promise((resolve) => {
    const stream = fs.createReadStream(file);
    const rl = readline.createInterface({
      input: stream,
    });

    openedFilesMap[file] = true;

    rl.on('line', (line: string) => {
      if (new RegExp(keyword, 'g').test(line)) {
        results.push(file);
        rl.close();
        rl.removeAllListeners();
        stream.destroy();
      }
    });

    stream.on('close', () => {
      resolve();
      delete openedFilesMap[file];
    });
  });

  return task;
}

/**
 * Print results
 * @param results
 */
export function printResults(results: string[], fileList: string[]) {
  results.forEach((result) => {
    console.log(`File: ${result}`);
  });

  console.log(`Count of searched files: ${fileList.length}`);
  console.log(`Count of lines containing keyword: ${results.length}`);
}
