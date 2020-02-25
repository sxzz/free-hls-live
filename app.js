const fs = require("fs");
const path = require("path");
const process = require("process");

const NodeMediaServer = require("node-media-server");
const _ = require("lodash");
const chokidar = require("chokidar");
const m3u8Parser = require("m3u8-parser");
require("dotenv").config();

const utils = require("./utils");

require("child_process").exec("rm -rf ./media/live/*");

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    mediaroot: "./media",
    allow_origin: "*"
  },
  trans: {
    ffmpeg: process.env.FFMPEG_PATH || "/usr/local/bin/ffmpeg",
    tasks: [
      {
        app: "live",
        hls: true,
        hlsFlags: "[hls_time=2:hls_list_size=3:hls_flags=delete_segments]"
      }
    ]
  }
};

const nms = new NodeMediaServer(config);
nms.run();

const lives = {};

const defaultLive = () => ({ sequence: 0, fileList: [], uploaded: {} });

nms.on("postPublish", (id, StreamPath, args) => {
  const stream_name = utils.getStreamName(StreamPath);
  lives[stream_name] = defaultLive();
});

nms.on("donePublish", (id, StreamPath, args) => {
  const stream_name = utils.getStreamName(StreamPath);
  delete lives[stream_name];
});

function build_new_manifest(stream_name, lines) {
  for (const filename of Object.keys(lives[stream_name].uploaded)) {
    lines = lines.replace(filename, lives[stream_name].uploaded[filename]);
  }

  const file = path.resolve(
    __dirname,
    "media",
    "live",
    stream_name,
    "live.m3u8"
  );

  fs.writeFileSync(file, lines, {
    flag: "w+",
    encoding: "utf-8"
  });
}

chokidar.watch("./media/live/*/index.m3u8").on("all", async (event, file) => {
  let lines;
  try {
    lines = fs.readFileSync(file, { encoding: "utf-8" });
  } catch (error) {
    return;
  }
  const parser = new m3u8Parser.Parser();
  parser.push(lines);
  parser.end();
  const manifest = parser.manifest;

  const stream_name = path.basename(path.dirname(file));
  if (manifest.mediaSequence < lives[stream_name].sequence) {
    lives[stream_name] = defaultLive();
  }

  const live = lives[stream_name];
  const segmentFiles = manifest.segments
    .map(segment => segment.uri)
    .filter(file => !file.startsWith("http"));
  const newFiles = _.difference(segmentFiles, live.fileList);
  if (newFiles.length == 0) {
    return;
  }

  const tasks = [];
  for (const newFile of newFiles) {
    tasks.push(
      utils.upload_yuque(path.resolve(file, "..", newFile)).then(url => {
        live.uploaded[newFile] = url;
      })
    );
  }
  await Promise.all(tasks);

  build_new_manifest(stream_name, lines);

  live.fileList = segmentFiles;
  live.sequence = manifest.mediaSequence;
});
