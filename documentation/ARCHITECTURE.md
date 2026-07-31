# Архитектура RP Cabinet v106

- Firebase Firestore — основной источник состояния профиля.
- Google Drive — скриншоты, аватар и JSON-манифесты публичных отчётов.
- OAuth `drive.file` — операции владельца с файлами.
- `js/config/public-config.js` — постоянный браузерный API key для анонимного чтения публичного JSON-отчёта.
- `report.html` читает ключ с домена панели; ключ не передаётся в URL.
- `localStorage` не используется для распространения публичного API key.
- `users/{uid}/profiles/default_realtime` остаётся постоянным облачным документом.
