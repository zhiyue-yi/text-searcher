import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { Result } from './types';
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
  console.log(fileList.length);
  const results: Result[] = [];
  const openedFilesMap = {};
  const tasks = [];
  let fileIndex = 0;

  while (fileIndex < fileList.length) {
    if (Object.keys(openedFilesMap).length < MAX_OPEN_FILE_COUNT) {
      tasks.push(
        new Promise((resolve) => {
          const file = fileList[fileIndex];

          const stream = fs.createReadStream(file);
          const rl = readline.createInterface({
            input: stream,
          });

          openedFilesMap[file] = true;

          let lineNo = 1;

          rl.on('line', (line: string) => {
            if (new RegExp(keyword, 'g').test(line)) {
              results.push({ file, line: lineNo });
              rl.close();
              rl.removeAllListeners();
              stream.destroy();
            }
            lineNo++;
          });

          stream.on('close', () => {
            resolve();
            delete openedFilesMap[file];
          });
        }),
      );
      fileIndex++;
    } else {
      // Need to let main event halt, and execute sub events
      // It could be better if there is Promise.any(), which is currently in TC39 Candidate Stage
      await Promise.all(tasks);
    }
  }

  await Promise.all(tasks);

  return results;
}

/**
 * Print results
 * @param results
 */
export function printResults(results: Result[], fileList: string[]) {
  results.forEach((result) => {
    console.log(`File: ${result.file}`);
    console.log(`Line: ${result.line}`);
  });

  const uniqueFiles = [...new Set(results.map((result) => result.file))];

  console.log(`Count of searched files: ${fileList.length}`);
  console.log(`Count of files containing keyword: ${uniqueFiles.length}`);
  console.log(`Count of lines containing keyword: ${results.length}`);
}

// /**
//  * Polyfill for Promise.any which is currently in TC39 Candidate Stage
//  * The promise any gets resolved if any of the promise from the array gets resolved
//  * From https://github.com/tc39/proposal-promise-any/issues/6
//  * @param promises
//  */
// export async function promiseAny(promises: Promise<any>[]) {
//   try {
//     const reasons = await Promise.all(
//       promises.map((promise) =>
//         promise.then(
//           (val) => {
//             throw val;
//           },
//           (reason) => reason,
//         ),
//       ),
//     );
//     throw reasons;
//   } catch (firstResolved) {
//     return firstResolved;
//   }
// }
