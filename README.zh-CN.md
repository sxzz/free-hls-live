# Free HLS 直播姬

利用 Free-HLS 实现免费直播

使用其他语言阅读：[English](./README.md) | 简体中文

**本项目仅供学习交流使用，在使用过程中对你或他人造成的任何损失我们概不负责。**

## Requirements

- Node.js
- Yarn
- 阿里云 OSS / 腾讯云 COS

## Installation

```bash
git clone https://github.com/sxzz/free-hls-live.git
cd free-hls-live
yarn install
```

## Usage

首先需要自行编写一个 Uploader，详见 [sxyazi/free-hls#19](https://github.com/sxyazi/free-hls/issues/19)

### 配置 Storage

由于 m3u8 文件是不断变化的，无法利用图床。

需要自行准备一个能储存文件且能被公网访问的服务，可以使用服务器、Aliyun OSS、TencentCloud COS 等，并且需要配置好 CORS 跨域。m3u8 文件一般较小，需要的费用较少。

复制 `config.example.yml` 为 `config.yml`

### 通过 OBS

1. 设置 -> 高级，填写一个固定的「文件名格式」，勾选「如果文件存在则覆盖」
2. 设置 -> 输出，将输出模式设置为「高级」。点击「录像」选项卡，将类型设置为「自定义输出（FFmpeg）」，并将容器格式设置为「hls」，并自行选择一个直播视频目录。

```bash
# config-path 配置文件路径，必填
# [steaming-folder] 直播视频目录路径
# [uploader-name] uploader 文件路径
yarn start [steaming-folder] -c <config-path> [-u uploader-name]
```

### 播放直播流

使用网页版播放器 `public/player.html` 进行播放

## 相关链接

- [sxzz/free-hls.js](https://github.com/sxzz/free-hls.js) HLS 上传工具（Node.js 版）
- [sxyazi/free-hls](https://github.com/sxyazi/free-hls) 一个免费的 HLS 解决方案

## 参考链接

- [How to do HLS streaming in OBS (Open Broadcast Studio)](https://obsproject.com/forum/resources/how-to-do-hls-streaming-in-obs-open-broadcast-studio.945/)

## 赞助者

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## 许可证

[AGPL-3.0](./LICENSE) License © 2020-PRESENT [三咲智子](https://github.com/sxzz)
