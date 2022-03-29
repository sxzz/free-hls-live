import type { StorageProvider, Uploader } from './types'

export const defineUploader = (uploader: Uploader) => uploader
export const defineStorageProvider = (provider: StorageProvider) => provider
