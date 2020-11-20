#!/usr/bin/env node

const fs = require('fs');
const { resolve } = require('path');
const { program } = require('commander');
const chokidar = require('chokidar');
const { green, red, blue } = require('chalk');
const { Parser } = require('m3u8-parser');

const { requireSafe, getConfig } = require('./utils');
const { version } = require('./package.json');

let dirs = [];
const uploadCache = {};

program
  .description('Free live streaming with Free-HLS')
  .version(version, '-v, --version')
  .arguments('[dir...]')
  .option('-c, --config <config-path>', 'set config path')
  .option('-u, --uploader <uploader-name>', 'set uploader')
  .action(dirsValue => (dirs = dirsValue));
program.parse(process.argv);

if (!program.config) throw new Error('config file does not exist!');
const config = getConfig(program.config);
if (program.uploader) config.uploader = program.uploader;
if (dirs.length === 0) dirs = config.dirs;

let uploader = requireSafe(`./uploader/${config.uploader}.js`);
if (!uploader) throw new Error('uploader does not exist!');
let storageProvider = requireSafe(`./storage/${config.storage.provider}.js`);
if (!storageProvider) throw new Error('storage provider does not exist!');

dirs.forEach(dir =>
  chokidar
    .watch('*.m3u8', { cwd: dir })
    .on('all', onPlaylistChange.bind(undefined, dir))
);

async function onPlaylistChange(baseDir, event, filename) {
  if (['unlink', 'unlinkDir'].includes(event)) return;

  const path = resolve(baseDir, filename);
  let content = fs.readFileSync(path, { encoding: 'utf-8' });

  const parser = new Parser();
  parser.push(content);
  parser.end();
  const manifest = parser.manifest;

  const tasks = [];
  for (const segment of manifest.segments) {
    if (segment.uri.match(/^(https?:)?\/\//)) {
      continue;
    }

    const videoPath = resolve(baseDir, segment.uri);
    let task;
    if (uploadCache[videoPath]) {
      task = Promise.resolve({
        filename: segment.uri,
        url: uploadCache[videoPath],
      });
    } else {
      const startTime = Date.now();
      task = uploader(videoPath)
        .then(url => {
          uploadCache[videoPath] = url;
          console.info(
            green(`uploaded ${segment.uri} to ${url}. `) +
              'cost ' +
              blue(`${Date.now() - startTime}ms.`)
          );
          return { filename: segment.uri, url };
        })
        .catch(err => {
          console.log(red(err));
          return null;
        });
    }
    tasks.push(task);
  }
  const results = await Promise.all(tasks);
  results
    .filter(result => !!result)
    .forEach(({ filename, url }) => {
      content = content.replace(
        new RegExp('^' + filename.replace(/\./g, '\\.') + '$', 'gm'),
        url
      );
    });

  storageProvider(path, content, config);
}
