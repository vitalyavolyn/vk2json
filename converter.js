import path from 'path'
import { promises as fs } from 'fs'

import parsers from './parsers/index.js'

export default async (argv) => {
  const root = argv.dir
  const contents = await fs.readdir(root, { withFileTypes: true })
  const dirs = contents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const result = {}

  const outputDir = path.resolve(argv.out || path.join(root, 'json'))
  await fs.mkdir(outputDir, { recursive: true })
  let counter = 0

  for (const dir of dirs) {
    if (argv.select && !argv.select.includes(dir)) continue

    // skip default output directory if it exists
    if (dir === 'json') continue

    console.log(`Processing directory "${dir}"`)
    if (!parsers[dir]) {
      console.log('Unknown directory type, skipping...')
      continue
    }

    // special case because user might have a shitton of dialogues
    // saving them right after parsing
    if (dir === 'messages') {
      await fs.mkdir(path.join(outputDir, 'messages'), { recursive: true })
      for await (const [peer, messages] of parsers.messages(path.join(root, dir), argv)) {
        await fs.writeFile(
          path.join(outputDir, 'messages', `${peer}.json`),
          JSON.stringify(messages, null, 2)
        )
        counter++
      }
    } else {
      result[dir] = await parsers[dir](path.join(root, dir), argv)
    }
  }

  for (const key in result) {
    await fs.writeFile(
      path.join(outputDir, `${key}.json`),
      JSON.stringify(result[key], null, 2)
    )

    counter++
  }

  // TODO: counter behaves weirdly
  console.log(`Wrote ${counter} files to ${outputDir}`)
  process.exit(0)
}
