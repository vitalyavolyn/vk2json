import { promises as fs } from 'fs'
import { parseHTML } from '../utils.js'

const parseBans = ($) => {
  const result = []
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
      const $ = await parseHTML(dir, page)
      const output = parsers[page]($)
      result[page.replace(/\.html$/, '')] = output
    } else {
      console.log(`Unknown "other" page: ${page}`)
    }
  }
  return result
}
