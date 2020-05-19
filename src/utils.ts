import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { Result } from './types';

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
    console.log(`Reading from: ${currentDir}`);

    const isDirectory = fs.statSync(currentDir).isDirectory();

    if (isDirectory) {
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
  const results: Result[] = [];

  const tasks = fileList.map(async (file: string) => {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: fs.createReadStream(file),
      });

      let lineNo = 1;

      rl.on('line', (line: string) => {
        if (new RegExp(keyword, 'g').test(line)) {
          results.push({ file, line: lineNo });
        }
        lineNo++;
      });

      rl.on('close', () => resolve());
    });
  });

  await Promise.all(tasks);
  return results;
}

/**
 * Print results
 * @param results
 */
export function printResults(results: Result[]) {
  results.forEach((result) => {
    console.log(`File: ${result.file}`);
    console.log(`Line: ${result.line}`);
  });
}
