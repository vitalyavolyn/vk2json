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
      // .option('messages-single-file', {
      //   describe: 'Save ALL conversations in a single file (not recommended)',
      //   type: 'boolean',
      //   default: false
      // })
      .option('select-peers', {
        describe: 'Only parse messages from specified peer_ids',
        type: 'array'
      })
      .option('select', {
        describe: 'Only parse data types (ads, apps, audio, bookmarks, comments, likes, messages, other, payments, photos, profile, sessions, verification, video, wall)',
        type: 'array'
      })
  }, converter)
  .argv
