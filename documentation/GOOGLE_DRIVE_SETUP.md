# Подключение Google Drive — v106

## Google Cloud

1. В проекте `rp-cabinet` включить Google Drive API.
2. В Google Auth Platform → Data Access добавить scope `https://www.googleapis.com/auth/drive.file`.
3. OAuth-приложение оставить External / In production.
4. В Web OAuth client добавить JavaScript origin `https://wxzg4bgc6n-code.github.io`.
5. Ключ `RP CABINET Drive Browser` ограничить Google Drive API и HTTP referrer `https://wxzg4bgc6n-code.github.io/*`.

## Настройка панели

Один раз вставить ключ в `js/config/public-config.js`:

```js
window.RP_PUBLIC_CONFIG=Object.freeze({
  googleDriveApiKey:'ТВОЙ_КЛЮЧ_RP_CABINET_DRIVE_BROWSER'
});
```

Этот файл является конфигурацией развёртывания. После настройки не заменять его следующими обновлениями.

Пользователи панели и получатели публичных ссылок ключ не вводят. Новые ссылки не содержат параметр `pk`.
