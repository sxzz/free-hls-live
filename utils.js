const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  async upload_yuque(file) {
    const data = new FormData();
    data.append("file", fs.createReadStream(file), {
      filename: "image.png",
      contentType: "image/png"
    });

    let res;
    try {
      res = await axios({
        url: `https://www.yuque.com/api/upload/attach?ctoken=${process.env.YUQUE_CTOKEN}`,
        method: "POST",
        data,
        headers: {
          Referer: "https://www.yuque.com/yuque/topics/new",
          Cookie: `ctoken=${process.env.YUQUE_CTOKEN}; _yuque_session=${process.env.YUQUE_SESSION}`,
          ...data.getHeaders()
        }
      });
    } catch (err) {
      if (err.response.status === 403) {
        console.warn("⚠️ Cookie 已过期");
        process.exit();
      } else {
        return Promise.reject(err);
      }
    }

    if (res.data.data && res.data.data.url) {
      return res.data.data.url;
    } else {
      return null;
    }
  }
};
