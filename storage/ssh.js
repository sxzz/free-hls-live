const fs = require('fs');
const { resolve, basename } = require('path');
const { NodeSSH } = require('node-ssh');
const { green } = require('colorette');

module.exports = async ({ localFile, filename, config }) => {
  const ssh = new NodeSSH();
  const connectConfig = { ...config.storage.connect };
  if (connectConfig.privateKey) {
    connectConfig.privateKey = fs.readFileSync(connectConfig.privateKey, {
      encoding: 'utf-8',
    });
  }
  await ssh.connect(connectConfig);

  const path = config.storage.path;
  const remoteFile = path + '/' + filename;

  return ssh.putFile(localFile, remoteFile).then(data => {
    console.log(
      green(`upload ${filename} file to server ${path} successfully.`)
    );
    return data;
  });
};
