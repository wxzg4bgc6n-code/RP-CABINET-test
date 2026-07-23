/*
 * v79 меняет схему синхронизации, поэтому получает отдельный локальный кэш.
 * Старые v77-ключи читаются только как источник одноразовой миграции.
 */
const KEY='rp_panel_account_profile_V79_REALTIME';
const VERSION_KEY='rp_panel_v79_realtime_cache';
const PROFILE_BACKUP_KEY='rp_panel_account_profile_V79_BACKUP';
