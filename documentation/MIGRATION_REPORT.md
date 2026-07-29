# Переход v92 → v93

## Удалено

- `proof-service/`;
- Vercel Functions;
- Vercel Blob Client;
- `js/vendor/vercel-blob-client.js`;
- `js/config/proof-service.js`;
- обращения к `/api/upload`, `/api/proofs/delete`, `/api/reports` и `/api/cleanup`;
- документация по переменным Vercel и Blob token.

## Добавлено

- `js/config/google-drive.js`;
- `js/services/google-drive-storage.js`;
- `js/features/google-drive-avatar.js`;
- `css/features/google-drive-avatar.css`;
- `documentation/GOOGLE_DRIVE_SETUP.md`.

## Формат файла доказательства

```json
{
  "provider": "google-drive",
  "fileId": "Drive file ID",
  "resourceKey": "optional resource key",
  "url": "public Drive API media URL",
  "name": "screen.webp",
  "type": "image/webp",
  "size": 123456,
  "width": 1920,
  "height": 1080,
  "uploadedAt": 0,
  "expiresAt": 0
}
```

## Формат отчёта

Отчёт является JSON-файлом версии 3 на Google Диске пользователя. `report.html` получает его напрямую через публичный Google Drive API key.

В Firebase сохраняются только:

- `provider`;
- `id` JSON-файла;
- `resourceKey`;
- публичная ссылка `report.html`;
- даты создания и окончания.

## Совместимость

- канонический профиль Firebase остаётся `default_realtime`;
- схема точечных обновлений остаётся v80;
- локальные ключи профиля не меняются;
- существующий прогресс, закрепления и премия не мигрируют в новый документ;
- старый активный отчёт v92 снимается из интерфейса, чтобы можно было сформировать новый Drive-отчёт;
- старые метаданные скриншотов могут быть показаны до замены, но новые загрузки идут только в Google Drive.

## Проверяемые сценарии

- вход через Google выдаёт Drive scope и сохраняет access token только на текущую сессию;
- без Google загрузка отключена;
- загрузка нескольких изображений не удаляет предыдущие;
- удаление изображения вызывает Drive `files.delete`;
- отчёт открывается без Google-входа;
- отчёт не содержит перехода в панель;
- изображения увеличиваются внутри отчёта;
- замена аватара удаляет предыдущий файл только после успешной загрузки нового;
- входящий Firebase snapshot сохраняет `fileId`, `resourceKey` и аватар;
- обновление страницы не отправляет старый профиль обратно.
