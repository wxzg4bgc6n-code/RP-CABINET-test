import crypto from 'node:crypto';
import { del, put } from '@vercel/blob';
import { isOwnedProofUrl, requireUser } from '../lib/auth.js';
import { applyCors, cleanText, readJsonBody, sendJson } from '../lib/http.js';
import { findReportBlob, readReport, REPORT_LIFETIME_MS } from '../lib/reports.js';

function publicManifest(manifest){
  if(!manifest) return null;
  const {ownerUid,...safe}=manifest;
  return safe;
}

function cleanFile(file,uid){
  if(!file || !isOwnedProofUrl(file.url,uid)) return null;
  return {
    url:file.url,
    downloadUrl:isOwnedProofUrl(file.downloadUrl||file.url,uid)?(file.downloadUrl||file.url):file.url,
    name:cleanText(file.name||'Скриншот',160),
    type:cleanText(file.type,60),
    size:Math.max(0,Number(file.size||0)),
    width:Math.max(0,Number(file.width||0)),
    height:Math.max(0,Number(file.height||0)),
    uploadedAt:Math.max(0,Number(file.uploadedAt||0))
  };
}

function cleanAvatarUrl(value){
  try{
    const url=new URL(String(value||'').trim());
    if(url.protocol!=='https:') return '';
    return cleanText(url.href,1200);
  }catch(error){
    return '';
  }
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method==='GET'){
    try{
      const {manifest}=await readReport(req.query?.id);
      if(!manifest) return sendJson(res,404,{error:'Отчёт не найден.'});
      if(Number(manifest.expiresAt||0)<=Date.now()) return sendJson(res,410,{error:'Срок хранения отчёта закончился.'});
      return sendJson(res,200,publicManifest(manifest));
    }catch(error){
      console.error('Report read error',error);
      return sendJson(res,500,{error:'Не удалось открыть отчёт.'});
    }
  }

  if(req.method==='POST'){
    try{
      const user=await requireUser(req);
      const body=readJsonBody(req)||{};
      const rawTasks=Array.isArray(body.tasks)?body.tasks.slice(0,100):[];
      if(!rawTasks.length || rawTasks.some(task=>task?.completed!==true)){
        return sendJson(res,400,{error:'Сначала выполни все пункты текущей ступени.'});
      }
      const tasks=rawTasks.map(task=>{
        const files=(Array.isArray(task.files)?task.files:[]).map(file=>cleanFile(file,user.uid)).filter(Boolean);
        return {
          title:cleanText(task.title,500),
          completed:true,
          required:task.required===true,
          files
        };
      });
      if(tasks.some(task=>task.required&&!task.files.length)){
        return sendJson(res,400,{error:'Для обязательного пункта не загружен скриншот.'});
      }
      const now=Date.now();
      const id=crypto.randomBytes(18).toString('hex');
      const profile=body.profile||{};
      const manifest={
        version:2,
        id,
        ownerUid:user.uid,
        contextKey:cleanText(body.contextKey,900),
        profile:{
          name:cleanText(profile.name,100),
          project:cleanText(profile.project,100),
          path:cleanText(profile.path,160),
          org:cleanText(profile.org,100),
          section:cleanText(profile.section,120),
          level:cleanText(profile.level,180),
          avatarUrl:cleanAvatarUrl(profile.avatarUrl)
        },
        tasks,
        createdAt:now,
        expiresAt:now+REPORT_LIFETIME_MS
      };
      await put(`reports/${id}/manifest.json`,JSON.stringify(manifest),{
        access:'public',
        contentType:'application/json; charset=utf-8',
        allowOverwrite:false
      });
      return sendJson(res,201,{id,createdAt:manifest.createdAt,expiresAt:manifest.expiresAt});
    }catch(error){
      console.error('Report create error',error);
      return sendJson(res,401,{error:'Не удалось подтвердить профиль или сохранить отчёт.'});
    }
  }

  if(req.method==='DELETE'){
    try{
      const user=await requireUser(req);
      const {blob,manifest}=await readReport(req.query?.id);
      if(!blob||!manifest) return sendJson(res,404,{error:'Отчёт уже удалён.'});
      if(manifest.ownerUid!==user.uid) return sendJson(res,403,{error:'Этот отчёт принадлежит другому профилю.'});
      const fileUrls=(manifest.tasks||[]).flatMap(task=>(task.files||[]).map(file=>file.url)).filter(url=>isOwnedProofUrl(url,user.uid));
      await del([...new Set([...fileUrls,blob.url])]);
      return sendJson(res,200,{ok:true});
    }catch(error){
      console.error('Report delete error',error);
      return sendJson(res,401,{error:'Не удалось удалить отчёт.'});
    }
  }

  return sendJson(res,405,{error:'Метод не поддерживается.'});
}
