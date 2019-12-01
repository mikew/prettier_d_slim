#!/usr/bin/env node
'use strict';

process.env.CORE_D_TITLE = 'prettier_d';
process.env.CORE_D_DOTFILE = '.prettier_d';
process.env.CORE_D_SERVICE = require.resolve('../lib/linter');
console.log(require(process.env.CORE_D_SERVICE))

function main() {
  const cmd = process.argv[2];

  if (cmd === '-v' || cmd === '--version') {
    console.log(
      'v%s (prettier_d v%s)',
      require('prettier/package.json').version,
      require('../package.json').version
    );

    return;
  }

  if (cmd === '-h' || cmd === '--help') {
    return;
  }

  const core_d = require('core_d');

  if (
    cmd === 'start'
    || cmd === 'stop'
    || cmd === 'restart'
    || cmd === 'status'
  ) {
    core_d[cmd]();
    return;
  }

  const args = process.argv.slice(2);
  if (args.indexOf('--stdin') > -1) {
    let text = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      text += chunk;
    });
    process.stdin.on('end', () => {
      core_d.invoke(args, text);
    });
    return;
  }

  core_d.invoke(args);
}

main();
