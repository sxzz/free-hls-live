const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  getStreamName(stream_path) {
    return stream_path.split("/").pop();
  },

  async upload_yuque(file) {
    return "URL";
  },
};
