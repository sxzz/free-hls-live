import fs from 'fs'
import { green } from 'colorette'
import COS from 'cos-nodejs-sdk-v5'
import { defineStorageProvider } from '../src/defines'

export default defineStorageProvider(async ({ filePath, filename, option }) => {
  const cos = new COS({
    SecretId: option.storage.secretId,
    SecretKey: option.storage.secretKey,
  })
  const path = option.storage.path + filename
  await cos.putObject({
    Bucket: option.storage.bucket,
    Region: option.storage.region,
    Key: path,
    Body: fs.createReadStream(filePath),
    StorageClass: 'STANDARD',
  })
  console.log(green(`upload ${filename} file to COS ${path} successfully.`))
})
