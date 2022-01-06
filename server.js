// publishing
const print = console.log;
import { createServer } from 'http';
import { join } from 'path';
import { readdir as readDir, readFile } from 'fs/promises';
import { mimetypes } from './lib/mimetypes.js';


// settings
const port = 8080;
const indexFile = 'index.html';
const defaultMimetype = 'text/plain';
const blocklist = [
  'lib/mimetypes.js',
  'design.scss',
  'package.json',
  'server.js',
];


const server = createServer(async (req, res) => {
  const urlDetails = new URL(req.url, 'http://localhost/');
  const path = urlDetails.pathname.substr(1) || indexFile;
  const absolutePath = join(process.cwd(), path);

  if (blocklist.includes(path) || !absolutePath.startsWith(process.cwd())) {
    res.statusCode = 403;
    res.end('403 Forbidden');
    return;
  }

  if (path === 'images.js') {
    const imageIds = (await readDir('./images'))
      .filter((filename) => filename.endsWith('.json'))
      .map((filename) => filename.replace('.json', ''));

    res.setHeader('Content-Type', mimetypes['js']);
    res.end(`export const images = ${JSON.stringify(imageIds, null, 2)}`);
    return;
  }

  try {

    const file = await readFile(path);

    res.setHeader('Content-Type', mimetypes[path.split('.').pop()] || defaultMimetype);

    res.end(file);
  } catch(error) {
    res.statusCode = 404;
    res.end('404 Not Found');
  }
});


server.listen(port);
