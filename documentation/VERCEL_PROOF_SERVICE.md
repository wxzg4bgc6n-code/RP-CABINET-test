# Подключение Vercel для отчётов

## Что где работает

- GitHub Pages: сама панель и `report.html`.
- Firebase: ник, настройки, прогресс и короткие ссылки на файлы.
- Vercel Functions: проверка владельца, создание и удаление отчёта.
- Vercel Blob: оригинальные скриншоты и JSON отчёта.

Cloudflare не используется.

## Рабочее подключение v75

- проект Vercel: `rp-cabinet-proof-service`;
- API: `https://rp-cabinet-proof-service.vercel.app`;
- Blob Store: Public, регион Washington (`iad1`);
- автоматическое удаление отчётов: через 8 дней;
- разрешённый адрес панели: `https://wxzg4bgc6n-code.github.io`.

## Первый запуск

1. Загрузить содержимое папки v75 в GitHub.
2. Серверную папку `proof-service` загрузить в отдельный проект Vercel через Drop либо подключить Git.
3. При подключении всего репозитория в Root Directory выбрать `proof-service`.
4. Создать Public Blob Store и подключить к проекту.
5. Добавить переменные:

   - `FIREBASE_WEB_API_KEY` — публичный Web API Key проекта Firebase; значение уже указано в `.env.example`;
   - `CRON_SECRET` — длинная случайная строка;
   - `ALLOWED_ORIGINS` — адрес GitHub Pages без завершающего `/`; временно допускается `*`.

   `BLOB_READ_WRITE_TOKEN` появляется автоматически после подключения Blob Store.

Firebase Admin и служебный JSON-ключ не требуются. Сервер проверяет ID token через Firebase Identity Toolkit. Это устраняет ошибку `Could not load the default credentials` на Vercel.

6. Выполнить Deploy.
7. Скопировать адрес вида `https://имя-проекта.vercel.app`.
8. Вставить его в `js/config/proof-service.js`.
9. Повторно загрузить изменённый файл на GitHub.

## Проверка без VPN

Сначала открыть на ПК и телефоне:

`https://rp-cabinet-proof-service.vercel.app/api/reports?id=test`

Ответ «Отчёт не найден» означает, что сервис доступен. После этого:

1. открыть панель через GitHub Pages;
2. войти через Google;
3. отметить пункт прогресса;
4. загрузить PNG/JPG/WEBP;
5. открыть оригинал и проверить, что края не исчезли;
6. выполнить все пункты и сформировать ссылку;
7. открыть ссылку в обычном браузере без VPN;
8. удалить тестовый отчёт.

## Ограничения

- до 15 МБ на один файл в интерфейсе панели;
- без фиксированного лимита количества файлов на один пункт;
- отчёт хранится 8 дней;
- очистка запускается ежедневно;
- Vercel Blob Client загружает файл напрямую, поэтому Function не принимает тело изображения.
