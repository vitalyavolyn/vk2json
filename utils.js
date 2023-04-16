import path from 'path'
import iconv from 'iconv-lite'
import { promises as fs } from 'fs'
import cheerio from 'cheerio'

export const getNumber = (str) => Number(str.match(/\d+/)[0])

export const sortPages = (a, b) => getNumber(a) - getNumber(b)

export const parseHTML = async (...pathSections) => {
  const filePath = path.join(...pathSections)
  const html = iconv.decode(await fs.readFile(filePath), 'win1251')
  return cheerio.load(html)
}
