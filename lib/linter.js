'use strict';

const path = require('path');
const LRU = require('nanolru');
const resolve = require('resolve');

const prettierCache = new LRU(10);

/** @type {(cwd: string) => CacheInstance} */
function createCache(cwd) {
  let prettierPath;
  try {
    prettierPath = resolve.sync('prettier', { basedir: cwd });
  } catch (e) {
    // module not found
    prettierPath = resolve.sync('prettier');
  }

  /** @type {import('prettier')} */
  const prettier = require(prettierPath);
  const configPath = prettier.resolveConfigFile.sync(cwd);
  const ignorePath = path.join(cwd, '.prettierignore');
  const options = prettier.resolveConfig.sync(cwd, {
    useCache: false,
    editorconfig: true
  }) || {};

  /** @type {CacheInstance} */
  const cacheInstance = {
    prettier,
    options,
    ignorePath,
    hasConfig: Boolean(configPath)
  };

  return prettierCache.set(cwd, cacheInstance);
}

/** @type {(cwd: string) => void} */
function clearRequireCache(cwd) {
  Object.keys(require.cache)
    .filter(key => key.startsWith(cwd))
    .forEach(key => {
      delete require.cache[key];
    });
}

/**
 * The core_d service entry point.
 * @type {(cwd: string, args: string[], text: string, mtime: number) => string}
 */
exports.invoke = function (cwd, args, text, mtime) {
  args = args.filter((x) => x !== '--no-color');
  process.chdir(cwd);

  /** @type {CacheInstance} */
  let cache = prettierCache.get(cwd);
  if (!cache) {
    cache = createCache(cwd);
  } else if (mtime > (cache.last_run || 0)) {
    clearRequireCache(cwd);
    cache = createCache(cwd);
  }
  cache.last_run = Date.now();

  // Skip if there is no prettier config.
  if (!cache.hasConfig) {
    return text;
  }

  // Skip if file is ignored.
  if (
    cache.prettier.getFileInfo.sync(args[1], {
      ignorePath: cache.ignorePath
    }).ignored
  ) {
    return text;
  }

  return cache.prettier.format(
    text,
    Object.assign({}, cache.options, {
      filepath: args[1]
    })
  );
};

exports.cache = prettierCache;

/**
 * The core_d status hook.
 */
exports.getStatus = function () {
  const { keys } = prettierCache;
  if (keys.length === 0) {
    return 'No instances cached.';
  }
  if (keys.length === 1) {
    return 'One instance cached.';
  }
  return `${keys.length} instances cached.`;
};

/**
 * @typedef {{
 *  hasConfig: boolean
 *  ignorePath: string
 *  options: import('prettier').Options
 *  prettier: import('prettier')
 *  last_run?: number
 * }} CacheInstance
 */
