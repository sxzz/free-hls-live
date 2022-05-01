# Free HLS Live [![npm](https://img.shields.io/npm/v/free-hls-live.svg)](https://npmjs.com/package/free-hls-live)

Free live streaming with Free-HLS.

Read this in other languages: English | [简体中文](./README.zh-CN.md)

**This project is for learning and communication purposes only, and we are not responsible for any losses caused to you or others during use.**

## Requirements

- Node.js
- Yarn
- Aliyun OSS / TencentCloud COS

## Installation

```bash
git clone https://github.com/sxzz/free-hls-live.git
cd free-hls-live
yarn install
```

## Usage

First, you need to write an Uploader by yourself, see [sxyazi/free-hls#19](https://github.com/sxyazi/free-hls/issues/19)

### Configure Storage

Because the m3u8 file is constantly changing, it cannot be implemented with the image bed

You need to have a service that can store files and can be accessed by the public network, such as servers, Aliyun OSS, TencentCloud COS, etc. And you need to configure CORS cross-domain. The m3u8 file is generally small and cost less.

Copy `config.example.yml` to `config.yml`

### Via OBS

1. In the settings dialog go to Advanced and set the recording filename. The default includes the current time. Choose something without any special % time values. You also need to enable Overwrite if file exists.
2. In the Settings Dialog go to Output, set output mode to Advanced and go to the recording tab. Here you set type to "Custom Output (ffmpeg)" and set container format to "hls". Set the file path to a folder.

```bash
# config-path: configuration file path
# [steaming-folder]: the path of the live video directory.
# [uploader-name]: uploader file path
yarn start [steaming-folder] -c <config-path> [-u uploader-name]
```

### Play live stream

Use the web player `public/player.html` to play

## Related

- [sxzz/free-hls.js](https://github.com/sxzz/free-hls.js) HLS upload tool (Written in Node.js)
- [sxyazi/free-hls](https://github.com/sxyazi/free-hls) A free HLS video solution

## Reference

- [How to do HLS streaming in OBS (Open Broadcast Studio)](https://obsproject.com/forum/resources/how-to-do-hls-streaming-in-obs-open-broadcast-studio.945/)

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[AGPL-3.0](./LICENSE) License © 2020-PRESENT [三咲智子](https://github.com/sxzz)
