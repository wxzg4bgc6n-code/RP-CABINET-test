# RP CABINET — TEST v106

## Что изменилось в v106

- Удалено окно ручного ввода API-ключа у пользователей панели.
- Публичный Google Drive API key вынесен в отдельный файл `js/config/public-config.js`.
- Получатели публичных ссылок и обычные пользователи ничего не вводят.
- Параметр `pk` удалён из новых ссылок отчётов.
- Старые ссылки с `pk` можно заменить обычной кнопкой «Копировать ссылку» после установки v106.
- Перед копированием отчёт по-прежнему проверяется анонимным запросом.
- Загрузка скриншотов остаётся независимой от публичного API-ключа.

## Одноразовая настройка владельца

1. Открой `js/config/public-config.js`.
2. Замени `PASTE_RP_CABINET_DRIVE_BROWSER_KEY_HERE` на ключ `RP CABINET Drive Browser` из Google Cloud.
3. Сохрани файл и загрузи его на GitHub.
4. В следующих обновлениях **не заменяй `js/config/public-config.js`**.

Браузерный API key не является OAuth client secret. Он должен быть ограничен:

- только доменом `https://wxzg4bgc6n-code.github.io/*`;
- только Google Drive API.

## Сохранено из v105

- Скриншоты после загрузки сразу добавляются в панель и сохраняются в Firebase.
- Загрузка скриншотов не зависит от ключа публичных отчётов.
- Полноэкранный просмотр работает без скачивания файла.

## Сохранено из v104

- Публичная ссылка проверяется перед копированием.
- Нерабочий отчёт не показывается как успешно сформированный.

## Что загружать на GitHub

Для перехода с v105 загрузи содержимое архива поверх текущего репозитория с сохранением структуры.

В корне проекта должны оставаться:

- `index.html`
- `report.html`
- `favicon.ico`
- `site.webmanifest`
- `assets/`
- `css/`
- `data/`
- `js/`
- `documentation/`
- `_tools/`
- `README.md`
- `build-summary.json`

Не загружать:

- `node_modules/`;
- `.env` и `.env.local`;
- OAuth client secret и refresh token;
- `proof-service/`.

## Где менять проект

| Изменение | Место |
|---|---|
| Публичный браузерный Drive API key | `js/config/public-config.js` |
| OAuth-настройки Drive и папки | `js/config/google-drive.js` |
| Загрузка/удаление файлов Google Drive | `js/services/google-drive-storage.js` |
| Скриншоты и формирование отчёта | `js/features/progress-proofs.js` |
| Публичный просмотр отчёта | `report.html`, `js/report.js`, `css/report.css` |
| Firebase и профиль | `js/app.js`, `js/core/realtime-state.js` |
| Номер тестовой версии | `js/core/version.js` |

## История версий

### v106 — Public report config

Ключ отчётов вынесен в постоянный файл развёртывания. Окно ввода и параметр `pk` удалены.

### v105 — Screenshot upload fix

Исправлено появление скриншотов в панели после загрузки на Google Drive.

### v104 — Public report key

Добавлена проверка публичного JSON-отчёта перед копированием ссылки.
