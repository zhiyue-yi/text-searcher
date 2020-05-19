import search from './search';

const [dir, keyword] = process.argv.slice(2);

if (!dir || !keyword) {
  throw Error(
    'You must provide 2 arguments: searching directory and the keyword to search',
  );
}

const start = new Date().getTime();
search(dir, keyword).then(() => {
  const end = new Date().getTime();
  const duration = (end - start) / 1000;
  console.log(`Time elapsed: ${duration} seconds`);

  process.exit();
});
