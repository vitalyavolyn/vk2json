import { promises as fs } from 'fs'
import path from 'path'
import cliProgress from 'cli-progress'
import { getNumber, parseHTML, sortPages } from '../utils.js'

const getIdFromLink = (str) => {
  const numberPart = () => getNumber(str)

  if (str.startsWith('id')) {
    return numberPart()
  }

  if (str.startsWith('public') || str.startsWith('club') || str.startsWith('event')) {
    return -numberPart()
  }

  console.log('Warning: unknown fromId pattern:', str)
  return str
}

const parseMessages = async ($) => {
  const messages = []
  const messageElements = $('.message').toArray()

  for (const msg of messageElements) {
    const el = $(msg)
    const message = {
      id: 0,
      body: '',
      date: '',
      attachments: [],
      fromId: 0
    }

    message.id = el.data().id

    const header = el.find('.message__header')
    const link = header.find('a')
    message.fromId = link.length
      ? getIdFromLink(link.attr('href').match(/vk\.com\/(.*)/)[1])
      : 0 // TODO
    const datePart = header.text().split(', ').at(-1)
    message.date = datePart.replace('(ред.)').trim() // TODO: parse date
    message.isEdited = datePart.includes('(ред.)') // TODO: parse deleted

    const content = header.next()
    message.body = $(content[0].children.filter((e) => e.type === 'text')).text()

    const attachmentsElements = content.find('.attachment').toArray()
    for (const el of attachmentsElements) {
      const type = $(el).find('.attachment__description').text() // TODO: parse type?
      const link = $(el).find('.attachment__link').text()
      message.attachments.push({ type, link })
    }

    messages.push(message)
  }

  return messages
}

export default async function * (dir, argv) {
  const $ = await parseHTML(dir, 'index-messages.html')
  const peers = $('.message-peer--id a')
    .toArray()
    .map((e) => e.attribs.href.split('/')[0])
    .map(Number)

  const bar = new cliProgress.SingleBar({
    format: '[{bar}] {percentage}% | {value}/{total} | Current: {peer}'
  }, cliProgress.Presets.legacy)
  bar.start(peers.length, 0)

  let parsedCount = 0

  const { selectPeers } = argv
  for (const peer of peers) {
    bar.update(bar.value + 1, { peer })
    // console.log(peer)
    if (selectPeers && !selectPeers.includes(peer)) continue
    const peerFiles = await fs.readdir(path.join(dir, peer.toString()))
    // console.log(peerFiles)
    for (const file of peerFiles.sort(sortPages)) {
      const $ = await parseHTML(dir, peer.toString(), file)
      const messages = await parseMessages($)
      parsedCount++
      yield [peer, messages]
    }
  }

  console.log(`Parsed ${parsedCount} conversations`)
  // return result
}
