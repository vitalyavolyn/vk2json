import { promises as fs } from 'fs'
import path from 'path'
import { getNumber, parseHTML } from '../utils.js'

// Comments and posts have same structure, this function does both
const parsePosts = async ($, dir) => {
  const items = $('.item').toArray()

  const posts = []

  for (const item of items) {
    const el = $(item)
    const post = {
      ownerId: 0,
      id: 0,
      text: '',
      attachments: [],
      comments: [],
      fromId: 0,
      date: ''
    }
    // TODO: add isDeleted

    const attachmentsElements = el.find('.attachment').toArray()
    for (const el of attachmentsElements) {
      const type = $(el).find('.attachment__description').text() // TODO: parse type?
      const link = $(el).find('.attachment__link').text()
      post.attachments.push({ type, link })
    }

    post.text = el
      .find('.item__main')
      .children()
      .first()
      .text()
      .trim()

    const link = el.find('.post__link').text()
    const [, ownerId, id, replyId] = link.match(/wall(\d+)_(\d+)((?:\?reply=(\d+)))?/)
    post.ownerId = Number(ownerId)
    post.id = Number(id)

    const footer = el.find('.item__tertiary span')
    const authorLink = footer.find('a')
    if (authorLink.length) {
      post.fromId = getNumber(authorLink.attr('href'))
    }

    authorLink?.remove()
    let rawDate = footer.text().replace(/^Вы /, '').trim()
    if (rawDate.endsWith('(Запись архивирована)')) {
      rawDate = rawDate.split('(')[0]
      post.isArchived = true
    }

    post.date = rawDate

    if (!replyId) {
      // This is a post, check comments
      try {
        const files = await fs.readdir(path.join(dir, id))
        for (const file of files) {
          const $ = await parseHTML(dir, id, file)
          // TODO: check comments order
          post.comments = await parsePosts($, dir)
        }
      } catch (e) {}
    } else {
      delete post.comments
    }

    posts.push(post)
  }

  return posts
}

export default async (dir) => {
  const contents = await fs.readdir(dir, { withFileTypes: true })
  const files = contents
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)

  const posts = []

  for (const file of files) {
    const $ = await parseHTML(dir, file)
    posts.push(...await parsePosts($, dir))
  }

  console.log(`Parsed ${posts.length} posts`)
  return posts
}
