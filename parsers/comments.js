import { promises as fs } from 'fs'
import path from 'path'
import { getNumber, parseHTML, sortPages } from '../utils.js'

const parseComments = async ($, dir) => {
  const items = $('.item').toArray()

  const comments = []

  for (const item of items) {
    const el = $(item)
    const comment = {
      text: '',
      link: '',
      attachments: [],
      date: ''
    }
    // TODO: add isDeleted

    const attachmentsElements = el.find('.attachment').toArray()
    for (const el of attachmentsElements) {
      const type = $(el).find('.attachment__description').text() // TODO: parse type?
      const link = $(el).find('.attachment__link').text()
      comment.attachments.push({ type, link })
    }

    const textEl = el.children().first()
    comment.text = textEl.text().trim() // TODO: preserve line breaks
    comment.link = textEl.next().text()
    comment.date = el.children().last().text()

    comments.push(comment)
  }

  return comments
}

export default async (dir) => {
  const contents = await fs.readdir(dir, { withFileTypes: true })
  const files = contents
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)

  const comments = []

  for (const file of files.sort(sortPages)) {
    const $ = await parseHTML(dir, file)
    comments.push(...await parseComments($, dir))
  }

  console.log(`Parsed ${comments.length} comments`)
  return comments
}
