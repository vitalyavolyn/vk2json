#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import converter from './converter.js'

// eslint-disable-next-line no-unused-expressions
yargs(hideBin(process.argv))
  .command('$0 <dir>', 'Convert html files from vk archive to json', (yargs) => {
    yargs
      .positional('dir', {
        describe: 'Path to directory with contents of Archive.zip',
        type: 'string'
      })
      .option('out', {
        alias: 'o',
        describe: 'Output directory (default: input_dir/json)',
        type: 'string'
      })
      .option('select-peers', {
        describe: 'Only parse messages from specified peer_ids',
        type: 'array'
      })
      .option('select', {
        describe: 'Select specific parsers to use',
        type: 'array'
      })
  }, converter)
  .argv
