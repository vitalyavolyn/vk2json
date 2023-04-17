import { parseHTML } from '../utils.js'

const parseAlbum = ($) => {
  const items = $('.audio')
  const songs = []
  for (const item of items.toArray()) {
    const el = $(item)
    const title = el.find('.audio__title').text()
    const duration = el.find('.audio__duration').text()
    songs.push({ title, duration })
  }

  return songs
}

export default async (dir) => {
  const $ = await parseHTML(dir, 'audio-albums.html')

  const playlists = []

  for (const item of $('.albums--link a').toArray()) {
    const el = $(item)
    const playlist = {
      title: '',
      id: 0,
      tracks: []
    }

    playlist.title = el.text()
    const link = el.attr('href')
    // console.log(link)
    try {
      const $album = await parseHTML(dir, link)
      playlist.tracks = parseAlbum($album)
    } catch (e) {
      if (e?.code !== 'ENOENT') {
        console.error(e)
      }
    }

    playlists.push(playlist)
  }

  console.log(`Parsed ${playlists.length} playlists`)
  return playlists
}
