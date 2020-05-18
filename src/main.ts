import search from './search';

const [dir, keyword] = process.argv.slice(2);

if (!dir || !keyword) {
  throw Error(
    'You must provide 2 arguments: searching directory and the keyword to search',
  );
}

search(dir, keyword);
