import os from 'os'
import path from 'path'
import { rmSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { program } from 'commander'
import chokidar from 'chokidar'
// @ts-expect-error
import { Parser } from 'm3u8-parser'
import { blue, green } from 'colorette'
import escapeStringRegexp from 'escape-string-regexp'
import pkg from '../package.json'
import { getConfig } from './utils/config'
import { importDefault } from './utils/imports'
import type {
  Option,
  OptionCli,
  OptionResolved,
  StorageProvider,
  Uploader,
} from './types'

program
  .description('Free live streaming with Free-HLS')
  .version(pkg.version, '-v, --version')
  .arguments('[dir...]')
  .requiredOption('-c, --config <config-path>', 'set config path')
  .option('-u, --uploader <uploader-path>', 'set uploader')
  .option(
    '-s, --storageProvider <storage-provider-path>',
    'set storage provider'
  )
  .option('-o, --output <output-path>', 'set output path')
  .action((dirs: string[]) => {
    type Opts = Pick<OptionCli, 'uploader' | 'config'>
    const options = program.opts<Opts>()
    run({ dirs, ...options })
  })
program.parse(process.argv)

function resolveOption(config: Option, cli: Option): OptionResolved {
  const uploader = cli.uploader || config.uploader
  if (!uploader) throw new Error('uploader does not exist')
  return {
    ...config,
    uploader,
    dirs: [...(config.dirs ?? []), ...(cli.dirs ?? [])],
    output: cli.output || config.output || '',
    storageProvider: cli.storageProvider || config.storageProvider || '',
  }
}

async function run({ config: configPath, ...cli }: OptionCli) {
  const option = resolveOption(await getConfig(configPath), cli)
  if (option.dirs.length === 0) throw new Error('dirs is empty')

  const uploader = importDefault<Uploader>(option.uploader)
  if (!uploader || typeof uploader !== 'function')
    throw new Error('cannot load uploader')

  let storageProvider: StorageProvider | undefined
  if (option.storageProvider) {
    storageProvider = importDefault<StorageProvider>(option.storageProvider)
    if (!storageProvider || typeof storageProvider !== 'function')
      throw new Error('cannot load storage provider')
  }

  if (!option.output) option.output = path.resolve(os.tmpdir(), pkg.name)
  try {
    await mkdir(option.output)
  } catch {
    // ignore error
  }

  const watchers = option.dirs.map((dir) => {
    const handleFn = onPlaylistChange.bind(undefined, {
      baseDir: dir,
      option,
      uploader,
      storageProvider,
    })

    return chokidar
      .watch('*.m3u8', { cwd: dir })
      .on('add', handleFn)
      .on('change', handleFn)
  })

  process.on('SIGINT', async () => {
    watchers.forEach((watcher) => watcher.close())
    rmSync(option.output, { recursive: true, force: true })
    process.exit(0)
  })
}

const uploadCache: Map<string, string> = new Map()

async function onPlaylistChange(
  opts: {
    baseDir: string
    option: OptionResolved
    uploader: Uploader
    storageProvider?: StorageProvider
  },
  filename: string
) {
  const { baseDir, option, uploader, storageProvider } = opts

  const playlistPath = path.resolve(baseDir, filename)
  let content = await readFile(playlistPath, 'utf-8')

  const parser = new Parser()
  parser.push(content)
  parser.end()
  const { manifest } = parser

  interface Segment {
    duration: number
    uri: string
    timeline: number
  }
  const unusedCache = new Set(uploadCache.keys())
  const tasks = (manifest.segments as Segment[])
    .filter((segment) => !segment.uri.match(/^(https?:)?\/\//))
    .map(async (segment) => {
      const filename = segment.uri
      const videoPath = path.resolve(baseDir, filename)

      if (uploadCache.has(videoPath)) {
        unusedCache.delete(videoPath)
        return {
          filename,
          url: uploadCache.get(videoPath)!,
        }
      } else {
        const startTime = Date.now()
        const url = await uploader(videoPath)
        uploadCache.set(videoPath, url)
        console.info(
          `${green(`uploaded ${filename} to ${url}. `)}cost ${blue(
            `${Date.now() - startTime}ms.`
          )}`
        )
        return { filename, url }
      }
    })
  Array.from(unusedCache).forEach((key) => uploadCache.delete(key))

  const results = (await Promise.all(tasks)).filter((result) => !!result)
  if (results.length === 0) return

  for (const { filename, url } of results) {
    const regex = `^${escapeStringRegexp(filename)}$`
    content = content.replace(new RegExp(regex, 'gm'), url)
  }

  const filePath = path.resolve(option.output, filename)
  await writeFile(filePath, content, 'utf-8')

  storageProvider?.({
    filePath,
    filename,
    option,
  })
}

export * from './types'
