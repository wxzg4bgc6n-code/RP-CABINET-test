/*
 * RP CABINET v93 — Google Drive хранит пользовательские изображения.
 *
 * apiKey используется только для чтения файлов, которым владелец отчёта
 * назначил доступ "всем, у кого есть ссылка". OAuth-доступ к личному Диску
 * выдаётся отдельно через Firebase Google Auth и scope drive.file.
 */
window.RP_GOOGLE_DRIVE=Object.freeze({
  apiKey:'AIzaSyBGp3zef5UjE5g0cTuErvKUumJ2302WdQQ',
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
