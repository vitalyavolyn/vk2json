import { promises as fs } from 'fs'
import { parseHTML, sortPages } from '../utils.js'

export default async (dir) => {
  const pages = await fs.readdir(dir)

  const result = []

  for (const page of pages.sort(sortPages)) {
    const $ = await parseHTML(dir, page)
    const items = $('.item').toArray()
    for (const item of items) {
      const session = {
        app: '',
        appLink: '',
        userAgent: '',
        ip: '',
        country: '',
        date: ''
      }

      const el = $(item)
      const appSection = el.find('.item__main').first()
      session.app = appSection.text()
      session.appLink = appSection.find('a').attr('href') || ''

      const uaSection = appSection.next()
      session.userAgent = uaSection.text().replace(/^User Agent: /, '')

      const ipSection = uaSection.next()
      const [ip, country] = ipSection.text().split(' ')
      session.ip = ip
      session.country = country.replace(/^\(|\)$/g, '')

      const dateSection = ipSection.next()
      session.date = dateSection.text() // TODO: parse?

      result.push(session)
    }
  }

  console.log(`Parsed ${result.length} sessions`)
  return result
}
