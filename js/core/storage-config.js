/*
 * v80 получает отдельный локальный кэш.
 * Он никогда не считается более новым, чем Firebase, и не отправляется при
 * открытии/обновлении страницы. Старые ключи читаются только для миграции.
 */
const KEY='rp_panel_account_profile_V80_REALTIME';
const VERSION_KEY='rp_panel_v80_realtime_cache';
const PROFILE_BACKUP_KEY='rp_panel_account_profile_V80_BACKUP';
