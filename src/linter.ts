import path from 'path'

import camelize from 'camelize'
import minimist from 'minimist'
import LRU from 'nanolru'
import { Options } from 'prettier'
import resolve from 'resolve'

export interface CacheInstance {
  hasConfig: boolean
  ignorePath: string
  options: Options
  prettier: typeof import('prettier')
  lastRun?: number
}

export type ParsedOptions = Options & {
  // Added by prettier_d_slim.
  stdin?: boolean
  stdinFilepath?: string
  // Alternate way of passing text
  text?: string
  // Colon separated string.
  pluginSearchDir?: string
  // Colon separated string.
  plugin?: string

  // Used in prettier cli.
  configPrecedence?: string
}

const prettierCache = new LRU<CacheInstance>(10)

function createCache(cwd: string, filePath = cwd) {
  let prettierPath

  try {
    prettierPath = resolve.sync('prettier', { basedir: cwd })
  } catch (e) {
    // module not found
    prettierPath = resolve.sync('prettier')
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prettier: CacheInstance['prettier'] = require(prettierPath)
  const configPath = prettier.resolveConfigFile.sync(filePath)
  const ignorePath = path.join(cwd, '.prettierignore')
  const options =
    prettier.resolveConfig.sync(filePath, {
      useCache: false,
      editorconfig: true,
    }) || {}

  const cacheInstance: CacheInstance = {
    prettier,
    options,
    ignorePath,
    hasConfig: Boolean(configPath),
  }

  return prettierCache.set(cwd, cacheInstance)
}

function clearRequireCache(cwd: string) {
  Object.keys(require.cache)
    .filter((key) => key.startsWith(cwd))
    .forEach((key) => {
      delete require.cache[key]
    })
}

function parseArguments(args: string[]) {
  const parsedOptions = camelize(
    minimist(args, {
      boolean: [
        'use-tabs',
        'semi',
        'single-quote',
        'jsx-single-quote',
        'bracket-spacing',
        'jsx-bracket-same-line',
        'require-pragma',
        'insert-pragma',
        'vue-indent-script-and-style',
        'config',
        'editorconfig',

        // Added by prettier_d_slim.
        'color',
        'stdin',
      ],
    }) as Options & {
      // Added by prettier_d_slim.
      stdin?: boolean
      stdinFilepath?: string
      // Alternate way of passing text
      text?: string
      // Colon separated string.
      pluginSearchDir?: string
      // Colon separated string.
      plugin?: string

      // Used in prettier cli.
      configPrecedence?: string
    },
  )

  if (parsedOptions.stdinFilepath) {
    parsedOptions.filepath = parsedOptions.stdinFilepath
  }

  if (parsedOptions.configPrecedence == null) {
    parsedOptions.configPrecedence = 'file-override'
  }

  return parsedOptions
}

declare module 'prettier' {
  interface FileInfoOptions {
    pluginSearchDirs?: string[]
  }
}

/**
 * The core_d service entry point.
 */
export const invoke = (
  cwd: string,
  args: string[],
  text: string,
  mtime: number,
  callback: (err: unknown, response: string) => void,
) => {
  process.chdir(cwd)

  let cache = prettierCache.get(cwd)
  if (!cache) {
    cache = createCache(cwd, parsedOptions.filepath)
  } else if (mtime > (cache.lastRun || 0)) {
    clearRequireCache(cwd)
    cache = createCache(cwd, parsedOptions.filepath)
  }
  cache.lastRun = Date.now()

  // Skip if there is no prettier config.
  if (!cache.hasConfig) {
    callback(null, text)
    return
  }

  const filePath = parsedOptions.filepath

  if (!filePath) {
    throw new Error('set filePath with `--stdin-filepath`')
  }

  const fileInfo = cache.prettier.getFileInfo.sync(filePath, {
    ignorePath: cache.ignorePath,
    pluginSearchDirs: parsedOptions.pluginSearchDir
      ? parsedOptions.pluginSearchDir.split(':')
      : undefined,
    plugins: parsedOptions.plugin ? parsedOptions.plugin.split(':') : undefined,
  })

  // Skip if file is ignored.
  if (fileInfo.ignored) {
    callback(null, text)
    return
  }

  let options: Options = {}
  switch (parsedOptions.configPrecedence) {
    case 'cli-override':
      options = Object.assign({}, cache.options, parsedOptions)
      break
    case 'file-override':
      options = Object.assign({}, parsedOptions, cache.options)
      break
  }

  if (parsedOptions.stdin && parsedOptions.filepath) {
    options.filepath = parsedOptions.filepath
  }

  callback(
    null,
    cache.prettier.format(parsedOptions.text ?? text, options),
  )
}

export const cache = prettierCache

/**
 * The core_d status hook.
 */
export const getStatus = () => {
  const { keys } = prettierCache
  if (keys.length === 0) {
    return 'No instances cached.'
  }
  if (keys.length === 1) {
    return 'One instance cached.'
  }
  return `${keys.length} instances cached.`
}
