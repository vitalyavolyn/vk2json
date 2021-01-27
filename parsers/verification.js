const fs = require('fs').promises
const path = require('path')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')

// TODO: test this on account with no verification requests
module.exports = async (dir) => {
  const filePath = path.join(dir, 'verification.html')
  const html = iconv.decode(await fs.readFile(filePath), 'win1251')
  const $ = cheerio.load(html)

  const requests = $('.item a').toArray()

  const result = []

  for (const request of requests) {
    const req = {
      subject: '',
      info: []
    }

    const filePath = path.join(dir, request.attribs.href)
    const html = iconv.decode(await fs.readFile(filePath), 'win1251')
    const $ = cheerio.load(html)

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

  console.log(`Parsed ${result.length} requests`)
  return result
}
