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

const parseSupport = ($) => {
  const result = []
  const items = $('.item').toArray()
  for (const item of items) {
    const request = {
      title: '',
      link: '',
      date: ''
    }

    const el = $(item)

    const link = el.find('a').first()
    request.title = link.text()
    request.link = link.attr('href')

    request.date = el.find('.item__tertiary').text() // TODO: parse?

    result.push(request)
  }

  console.log(`Parsed ${result.length} support requests`)
  return result
}

const parsers = {
  'bans.html': parseBans,
  'support.html': parseSupport
}

export default async (dir) => {
  const contents = await fs.readdir(dir, { withFileTypes: true })
  const pages = contents
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)

  const result = {}

  for (const page of pages) {
    if (parsers[page]) {
      const $ = await parseHTML(dir, page)
      const output = parsers[page]($)
      result[page.replace(/\.html$/, '')] = output
    } else {
      console.log(`Unsupported "other" page: ${page}`)
    }
  }
  return result
}
