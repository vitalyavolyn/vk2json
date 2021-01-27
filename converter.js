const fs = require('fs').promises
const path = require('path')
const parsers = require('./parsers')

module.exports = async (argv) => {
  const root = argv.dir
  const contents = await fs.readdir(root, { withFileTypes: true })
  const dirs = contents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const result = {}

  for (const dir of dirs) {
    if (argv.select && !argv.select.includes(dir)) continue

    console.log(`Processing directory "${dir}"`)
    if (!parsers[dir]) {
      console.log('Unknown directory type, skipping...')
      continue
    }

    result[dir] = await parsers[dir](path.join(root, dir), argv)
  }

  const outputDir = path.resolve(argv.out || path.join(root, 'json'))
  await fs.mkdir(outputDir, { recursive: true })
  let counter = 0

  for (const key in result) {
    if (key === 'messages') {
      await fs.mkdir(path.join(outputDir, 'messages'), { recursive: true })
      for (const peer in result[key]) {
        await fs.writeFile(
          path.join(outputDir, 'messages', `${peer}.json`),
          JSON.stringify(result[key][peer], null, 2)
        )

        counter++
      }
    } else {
      await fs.writeFile(
        path.join(outputDir, `${key}.json`),
        JSON.stringify(result[key], null, 2)
      )

      counter++
    }
  }

  console.log(`Wrote ${counter} files to ${outputDir}`)
}
