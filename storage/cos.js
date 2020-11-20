const { basename } = require('path');
const { green } = require('chalk');
const COS = require('cos-nodejs-sdk-v5');

module.exports = (filename, content, config) =>
  new Promise((resolve, reject) => {
    const cos = new COS({
      SecretId: config.storage.secretId,
      SecretKey: config.storage.secretKey,
    });

    const path = config.storage.path + basename(filename);
    cos.putObject(
      {
        Bucket: config.storage.bucket,
        Region: config.storage.region,
        Key: path,
        Body: content,
      },
      function (err, data) {
        if (err) reject(err);
        else {
          console.log(
            green(
              `upload ${basename(filename)} file to COS ${path} successfully.`
            )
          );
          resolve(data);
        }
      }
    );
  });
