const fs = require("fs");
const path = require("path");
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
    ffmpeg: "/usr/local/bin/ffmpeg",
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

const liveInfo = {
  sequence: 0,
  fileList: [],
  uploaded: {}
};

function replace_manifest(file) {
  let lines = fs.readFileSync(file, {
    flag: "r",
    encoding: "utf-8"
  });

  for (const filename of Object.keys(liveInfo.uploaded)) {
    lines = lines.replace(filename, liveInfo.uploaded[filename]);
  }

  fs.writeFileSync(file, lines, { flag: "r+", encoding: "utf-8" });
  return lines;
}

chokidar.watch("./media/live/*/index.m3u8").on("all", async (event, file) => {
  const lines = replace_manifest(file);

  const parser = new m3u8Parser.Parser();
  parser.push(lines);
  parser.end();

  const manifest = parser.manifest;
  if (manifest.mediaSequence < liveInfo.sequence) {
    this.liveInfo.fileList = [];
    this.liveInfo.uploaded = {};
  }

  const segmentFiles = manifest.segments
    .map(segment => segment.uri)
    .filter(file => !file.startsWith("http"));
  const newFiles = _.difference(segmentFiles, liveInfo.fileList);

  if (newFiles.length == 0) {
    return;
  }

  const tasks = [];
  for (const newFile of newFiles) {
    tasks.push(
      utils.upload_yuque(path.resolve(file, "..", newFile)).then(url => {
        liveInfo.uploaded[newFile] = url;
      })
    );
  }
  await Promise.all(tasks);
  replace_manifest(file);

  liveInfo.fileList = segmentFiles;
});
