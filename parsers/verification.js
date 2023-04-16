import { parseHTML } from '../utils.js'

// TODO: test this on account with no verification requests
export default async (dir) => {
  const $ = await parseHTML(dir, 'verification.html')

  const requests = $('.item a').toArray()

  const result = []

  for (const request of requests) {
    const req = {
      subject: '',
      info: []
    }

    const $ = await parseHTML(dir, request.attribs.href)

    const firstItem = $('.item')
    req.subject = firstItem.find('a').attr('href')

    const items = firstItem.nextAll().toArray()
    for (const item of items) {
      const el = $(item)
      const title = el.find('.item__main').text().replace(/:$/, '')
      const value = el.find('.item__tertiary').text()
      // TODO: parse "Данных нет"?
      req.info.push({ title, value })
    }

    result.push(req)
  }

  console.log(`Parsed ${result.length} verification requests`)
  return result
}
