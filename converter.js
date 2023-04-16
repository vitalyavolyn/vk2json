import path from 'path'
import { promises as fs } from 'fs'

import parsers from './parsers/index.js'

export default async (argv) => {
  const root = argv.dir
  const contents = await fs.readdir(root, { withFileTypes: true })
  const dirs = contents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

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
    // saving conversations one-by-one right after parsing
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
      const result = await parsers[dir](path.join(root, dir), argv)
      await fs.writeFile(
        path.join(outputDir, `${dir}.json`),
        JSON.stringify(result, null, 2)
      )

      counter++
    }
  }

  console.log(`Wrote ${counter} files to ${outputDir}`)
  process.exit(0)
}
