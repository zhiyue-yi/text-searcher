# Text Searcher

Text Searcher is a command line tool to search texts in files with a directory given.

# Installation

Install the dependencies
`npm install`

Run text searcher provided the target path and keyword
`npm start -- [path] [keyword]`

Example: search "TODO" under "./tests/sample" directory
`npm start -- ./tests/sample TODO`

Run unit tests
`npm run test`

# Program Flow

![Program-flow](./docs/program-flow.png)

# Design Concerns

## Using read line instead of read file

Since the requirement states that only the file path is needed once the key word if found, reading the whole file into the memory is unnecessary. Some files may be extremely large, which may occupy a large amount of memory. Instead, reading the file line by line allows to exit from the read stream anytime if the key word if found, because reading lines reduce the burden of memory. Relatively smaller portion of memory is used.

## Using MAX_OPEN_FILE_COUNT to control file streams to open concurrently

There is a limitation on the maximum number of files can be open at the same time. Therefore, number of file streams to open has to be controlled.

`await Promise.all(tasks);` has to be executed after the number of opened file streams hit the maximum number. Otherwise, the program will be infinitely looping within `while` loop. After executing `await Promise.all(tasks);`, the async functions can be actually executed and as a results, opened file streams can be processed and cleared.

# Performance Testing
