import { promises as fs } from 'fs'
import path from 'path'
import iconv from 'iconv-lite'
import cheerio from 'cheerio'

const parseBans = (html) => {
  const result = []
  const $ = cheerio.load(html)
  const items = $('.item').toArray()
  for (const item of items) {
    const ban = {
      info: '',
      date: ''
    }

    const el = $(item)
    const infoRow = el.find('.item__main').first()
    ban.info = infoRow.text()

    const dateSection = infoRow.next()
    ban.date = dateSection.text() // TODO: parse?

    result.push(ban)
  }

  console.log(`Parsed ${result.length} bans`)
  return result
}

const parsers = {
  'bans.html': parseBans
}

export default async (dir) => {
  const pages = await fs.readdir(dir)

  const result = {}

  for (const page of pages) {
    if (parsers[page]) {
      const filePath = path.join(dir, page)
      const html = iconv.decode(await fs.readFile(filePath), 'win1251')
      const output = parsers[page](html)
      result[page.replace(/\.html$/, '')] = output
    } else {
      console.log(`Unknown "other" page: ${page}`)
    }
  }
  return result
}
