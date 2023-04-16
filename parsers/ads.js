import { promises as fs } from 'fs'
import { parseHTML } from '../utils.js'

const getRetargetingCount = async (dir) => {
  const $ = await parseHTML(dir, 'retargeting.html')
  return Number($('.item__main').text().match(/\d+/)[0])
}

const getInterests = async (dir) => {
  const interests = []

  const files = await fs.readdir(dir)
  for (const file of files) {
    if (!file.startsWith('interests')) continue

    const $ = await parseHTML(dir, file)

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
  const $ = await parseHTML(dir, 'geo-points.html')

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
  const $ = await parseHTML(dir, 'offices.html')

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
