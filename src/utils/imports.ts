import { register } from 'esbuild-register/dist/node'
import pkg from '../../package.json'

export const importDefault = <T>(path: string) => {
  let unregister: (() => void) | undefined
  if (path.endsWith('.ts')) ({ unregister } = register())
  if (path.startsWith(`${pkg.name}/`)) path = path.replace(`${pkg.name}/`, './')

  try {
    const id = require.resolve(path, { paths: [process.cwd()] })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(id)
    return module.default as T
  } catch (err) {
    console.error(err)
  } finally {
    unregister?.()
  }
}
