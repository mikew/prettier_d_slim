#!/usr/bin/env node

import winston from 'winston'

process.env.CORE_D_TITLE = 'prettier_d'
process.env.CORE_D_DOTFILE = '.prettier_d'
process.env.CORE_D_SERVICE = require.resolve('../linter')

// Needs to be imported after env vars are set.
import coreD from 'core_d'

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.File({ filename: '/tmp/prettier_d.log' }),
  ],
})

logger.debug('hello from prettier_d.js?')

function main() {
  const cmd = process.argv[2]

  if (cmd === '-v' || cmd === '--version') {
    console.log(
      'v%s (prettier_d v%s)',
      require('prettier/package.json').version,
      require('../package.json').version,
    )

    return
  }

  if (cmd === '-h' || cmd === '--help') {
    return
  }

  if (
    cmd === 'start' ||
    cmd === 'stop' ||
    cmd === 'restart' ||
    cmd === 'status'
  ) {
    coreD[cmd]()
    return
  }

  const args = process.argv.slice(2)
  if (args.indexOf('--stdin') > -1) {
    let text = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      text += chunk
    })
    process.stdin.on('end', () => {
      coreD.invoke(args, text)
    })
    return
  }

  coreD.invoke(args)
}

main()
