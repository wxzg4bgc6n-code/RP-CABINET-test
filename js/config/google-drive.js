/*
 * RP CABINET v104 — настройки Google Drive.
 *
 * Публичный API key больше не зашит в обновления панели. Он вводится один
 * раз при создании отчёта, хранится в localStorage владельца и включается в
 * сформированную ссылку. OAuth-доступ к личному Диску по-прежнему выдаётся
 * отдельно через Firebase Google Auth и scope drive.file.
 */
window.RP_GOOGLE_DRIVE=Object.freeze({
  apiKey:'',
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
