import { promises as fs } from 'fs'
import path from 'path'
import iconv from 'iconv-lite'
import cheerio from 'cheerio'

const getRetargetingCount = async (dir) => {
  const filePath = path.join(dir, 'retargeting.html')
  const html = iconv.decode(await fs.readFile(filePath), 'win1251')
  const $ = cheerio.load(html)
  return Number($('.item__main').text().match(/\d+/)[0])
}

const getInterests = async (dir) => {
  const interests = []

  const files = await fs.readdir(dir)
  for (const file of files) {
    if (!file.startsWith('interests')) continue

    const filePath = path.join(dir, file)
    const html = iconv.decode(await fs.readFile(filePath), 'win1251')
    const $ = cheerio.load(html)

    for (const item of $('.item').toArray()) {
      const el = $(item)
      const title = el.find('.item__main').text()
      const type = el.find('.item__tertiary').text()
      interests.push({ title, type })
    }
  }

  return interests
}

const getPlaces = async (dir) => {
  const filePath = path.join(dir, 'geo-points.html')
  const html = iconv.decode(await fs.readFile(filePath), 'win1251')
  const $ = cheerio.load(html)

  const places = []

  for (const item of $('.item').toArray()) {
    const el = $(item)
    const link = el.find('a').attr('href')

    const [, latitude, longitude] = link.match(/q=([\d.]+),([\d.]+)/)

    const updated = el.find('.item__tertiary').text() // TODO: only keep date
    places.push({ latitude: Number(latitude), longitude: Number(longitude), updated })
  }

  return places
}

const getCabinets = async (dir) => {
  const filePath = path.join(dir, 'offices.html')
  const html = iconv.decode(await fs.readFile(filePath), 'win1251')
  const $ = cheerio.load(html)

  const cabinets = []

  for (const item of $('.item').toArray()) {
    const el = $(item)
    const link = el.find('a').attr('href')
    const title = el.find('.item__main').text()
    const created = el.find('.item__tertiary').text() // TODO: date
    cabinets.push({ title, created, link })
  }

  return cabinets
}

export default async (dir) => {
  // TODO: check on account without ad cabinets
  const result = {
    retargetingCount: await getRetargetingCount(dir),
    interests: await getInterests(dir),
    places: await getPlaces(dir),
    cabinets: await getCabinets(dir)
  }

  console.log(`Parsed ads info (retargeting count, ${result.interests.length} interests, ${result.places.length} places, ${result.cabinets.length} cabinets)`)
  return result
}
