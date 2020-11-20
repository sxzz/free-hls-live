const fs = require('fs');
const { green } = require('chalk');
const COS = require('cos-nodejs-sdk-v5');

module.exports = ({ localFile, filename, config }) =>
  new Promise((resolve, reject) => {
    const cos = new COS({
      SecretId: config.storage.secretId,
      SecretKey: config.storage.secretKey,
    });
    const path = config.storage.path + filename;
    cos.putObject(
      {
        Bucket: config.storage.bucket,
        Region: config.storage.region,
        Key: path,
        Body: fs.createReadStream(localFile),
        StorageClass: 'STANDARD',
      },
      function (err, data) {
        if (err) reject(err);
        else {
          console.log(
            green(`upload ${filename} file to COS ${path} successfully.`)
          );
          resolve(data);
        }
      }
    );
  });
