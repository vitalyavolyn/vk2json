import { promises as fs } from 'fs'
import path from 'path'
import iconv from 'iconv-lite'
import cheerio from 'cheerio'

const getString = (row) => row.find('div:not(.item__tertiary)').first().text()
const getNumber = (str) => Number(str.match(/\d+/)[0])

export default async (dir) => {
  const filePath = path.join(dir, 'page-info.html')
  const html = iconv.decode(await fs.readFile(filePath), 'win1251')
  const $ = cheerio.load(html)
  const result = {}

  result.profilePic = $('img.fans_fan_img').first().attr('src')

  let row = $('.item')
  const next = () => { row = row.next() }

  // TODO: optimize this
  next()
  result.name = getString(row)

  next()
  result.bday = getString(row)

  next()
  result.phone = getString(row)

  next()
  result.email = getString(row)

  next()
  result.connectedDevice = getString(row)

  next()
  result.regDate = getString(row) // TODO: parse date

  // TODO: may have a link to a group?
  next()
  result.work = getString(row)

  next()
  result.city = getString(row)

  next()
  result.country = getString(row)

  next()
  result.publicPhone = getString(row)

  next()
  result.additionalPhone = getString(row)

  next()
  result.hometown = getString(row)

  next()
  const link = row.find('a')
  result.familyStatus = {
    text: getString(row),
    partnerId: link ? getNumber(link.attr('href')) : undefined
  }

  next()
  result.militaryService = getString(row)

  next()
  result.school = getString(row)

  next()
  result.university = getString(row)

  next()
  result.sex = getString(row)

  next()
  result.status = getString(row)

  next()
  result.website = getString(row)

  next()
  result.languages = getString(row).split(', ')

  next()
  result.grandparents = getString(row) // TODO: this and later, may have links

  next()
  result.parents = getString(row)

  next()
  result.siblings = getString(row)

  next()
  result.children = getString(row)

  next()
  result.grandchildren = getString(row)

  next()
  result.bio = getString(row)

  next()
  result.activity = getString(row)

  next()
  result.drinking = getString(row)

  next()
  result.favoriteBooks = getString(row)

  next()
  result.favoriteGames = getString(row)

  next()
  result.favoriteQuotes = getString(row)

  next()
  result.inspiredBy = getString(row)

  next()
  result.hobbies = getString(row)

  next()
  result.values = getString(row)

  next()
  result.favoriteMovies = getString(row)

  next()
  result.favoriteMusic = getString(row)

  next()
  result.valuesInPeople = getString(row)

  next()
  result.smoking = getString(row)

  next()
  result.favoriteTvShows = getString(row)

  next()
  result.liveJournalNickname = getString(row)

  next()
  result.skypeNickname = getString(row)

  next()
  result.twitterNickname = getString(row)

  next()
  result.instagramNickname = getString(row)

  next()
  result.facebookNickname = getString(row)

  return result
}