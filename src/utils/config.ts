import { readFile } from 'fs/promises'
import toml from 'toml'
import type { Option } from '..'

export const getConfig = async (path: string) => {
  const content = await readFile(path, 'utf-8')
  return toml.parse(content) as Option
}
