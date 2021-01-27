# vk2json

Инструмент для конвертации html-файлов из [архива с выгруженными данными ВКонтакте](https://vk.com/data_protection?section=rules) в машиночитаемый JSON-формат.

Может быть полезно для анализа диалогов (и т.п.) без запросов к API.

Перед использованием необходимо извлечь содержимое архива.

- [x] ads
- [ ] audio
- [ ] comments
- [ ] likes
- [ ] other
- [ ] photos
- [x] sessions
- [x] verification
- [x] wall
- [x] apps
- [ ] bookmarks
- [x] messages
- [ ] payments
- [ ] profile
- [ ] video

## Использование

```sh
$ yarn global add vk2json
$ vk2json /path/to/dir

# Использование без глобальной установки:
$ npx vk2json /path/to/dir
```

## Параметры командной строки

`--output, -o`

Папка, в которую будут записаны JSON - файлы (по умолчанию - в папке с html будет создана папка `json`)

`--select-peers`

Массив peer_id, сообщения которых будут парситься (по умолчанию - все диалоги)

`--select`

Массив типов данных, которые будут конвертированы из html в json

`ads`, `apps`, `audio`, `bookmarks`, `comments`, `likes`, `messages`, `other`, `payments`, `photos`, `profile`, `sessions`, `verification`, `video`, `wall`

Пример: `--select ads messages`

## Примеры

Выгрузка сообщений с пользователем 152199439:

```sh
$ vk2json /path/to/dir --select-peers 152199439 --select messages
Processing directory "messages"
Parsed 1 conversations
Wrote 1 files to /path/to/dir/json
```
