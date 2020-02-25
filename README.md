# Free HLS 直播姬

利用 Free-HLS 实现免费直播

**本项目仅供学习交流使用，在使用过程中对你或他人造成的任何损失我们概不负责。**

## Requirements
- NodeJS
- Yarn
- FFmpeg

## Installation

```bash
git clone https://github.com/sxzz/free-hls-live.git
cd free-hls.js
yarn install
yarn start
```

## Usage

### 使用 OBS 推流

> Settings -> Stream

Stream Type : Custom Streaming Server

URL : rtmp://localhost/live

Stream key : STREAM_NAME

### 播放直播流

使用以下命令或使用网页版播放器 `public/player.html`

```bash
ffplay http://hostname:8000/live/STREAM_NAME/live.m3u8
```

## Related

- [sxzz/free-hls.js](https://github.com/sxzz/free-hls.js) HLS 上传工具（Node.js 版）
- [sxyazi/free-hls](https://github.com/sxyazi/free-hls) 一个免费的 HLS 解决方案
- [illuspas/Node-Media-Server](https://github.com/illuspas/Node-Media-Server) A Node.js implementation of RTMP/HTTP-FLV/WS-FLV/HLS/DASH/MP4 Media Server