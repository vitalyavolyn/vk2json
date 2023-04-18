import { parseHTML } from '../utils.js'

export default async (dir) => {
  const $ = await parseHTML(dir, 'installed-apps.html')

  const apps = []

  for (const item of $('.item').toArray()) {
    const el = $(item)
    const app = {
      title: '',
      id: 0,
      scope: '',
      lastUsed: '',
      isAdmin: false
    }

    const title = el.children().first()
    app.title = title.text()

    const id = title.next()
    app.id = Number(id.text().replace('app', ''))

    const scope = id.next()
    app.scope = scope.text().replace('Права приложения: ', '') // TODO: parse and convert to proper scope format used in oAuth?

    const lastUsed = scope.next()
    app.lastUsed = lastUsed.text()

    if (lastUsed.next().length) {
      app.isAdmin = true
      app.lastUsed = lastUsed.next().text()
    }

    apps.push(app)
  }

  console.log(`Parsed ${apps.length} apps`)
  return apps
}
