import { promises as fs } from 'fs'
import path from 'path'
import { parseHTML } from '../utils.js'

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
      comments: []
    }
    // TODO: add isDeleted, date, fromId

    const attachmentsElements = el.find('.attachment').toArray()
    for (const el of attachmentsElements) {
      const type = $(el).find('.attachment__description').text() // TODO: parse type?
      const link = $(el).find('.attachment__link').text()
      post.attachments.push({ type, link })
    }

    post.text = el
      .find('.item__main')
      .children()
      .map((_, e) => e.children[0].type === 'text' ? e.children[0] : null) // 🤪
      .text()
      .trim()

    const link = el.find('.post__link').text()
    const [, ownerId, id, replyId] = link.match(/wall(\d+)_(\d+)((?:\?reply=(\d+)))?/)
    post.ownerId = Number(ownerId)
    post.id = Number(id)

    if (!replyId) {
      // This is a post, check comments
      try {
        const files = await fs.readdir(path.join(dir, id))
        for (const file of files) {
          const $ = await parseHTML(dir, id, file)
          const comments = await parsePosts($, dir)
          // TODO: check comments order
          post.comments = comments
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
