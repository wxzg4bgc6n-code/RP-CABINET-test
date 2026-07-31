/*
 * RP CABINET v106 — настройки Google Drive.
 *
 * Публичный браузерный API key берётся из js/config/public-config.js.
 * OAuth-доступ к личному Диску выдаётся отдельно через Firebase Google Auth
 * и scope drive.file.
 */
window.RP_GOOGLE_DRIVE=Object.freeze({
  apiKey:String(window.RP_PUBLIC_CONFIG?.googleDriveApiKey||'').trim(),
  scope:'https://www.googleapis.com/auth/drive.file',
  rootFolderName:'RP CABINET',
  screenshotsFolderName:'Скриншоты',
  reportsFolderName:'Отчёты',
  avatarsFolderName:'Аватар',
  maxFileBytes:15*1024*1024,
  maxFilesPerTask:null,
  reportLifetimeDays:8,
  avatarMaxBytes:2*1024*1024,
  avatarSize:512
});
