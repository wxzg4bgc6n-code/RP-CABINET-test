import { del } from '@vercel/blob';
import { applyCors, sendJson } from '../lib/http.js';
import { listAll } from '../lib/reports.js';

const EIGHT_DAYS=8*24*60*60*1000;

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  const expected=`Bearer ${process.env.CRON_SECRET||''}`;
  if(!process.env.CRON_SECRET || req.headers.authorization!==expected) return sendJson(res,401,{error:'Недостаточно прав.'});
  try{
    const now=Date.now();
    const manifests=await listAll('reports/');
    const activeFiles=new Set();
    let expiredReports=0;
    for(const blob of manifests.filter(item=>item.pathname.endsWith('/manifest.json'))){
      try{
        const response=await fetch(blob.url,{cache:'no-store'});
        const manifest=await response.json();
        const urls=(manifest.tasks||[]).flatMap(task=>(task.files||[]).map(file=>file.url)).filter(Boolean);
        if(Number(manifest.expiresAt||0)<=now){
          await del([...new Set([...urls,blob.url])]);
          expiredReports++;
        }else{
          urls.forEach(url=>activeFiles.add(url));
        }
      }catch(error){
        const uploadedAt=new Date(blob.uploadedAt||0).getTime();
        if(uploadedAt&&uploadedAt<now-EIGHT_DAYS) await del(blob.url);
      }
    }
    const proofs=await listAll('proofs/');
    const orphanUrls=proofs
      .filter(blob=>!activeFiles.has(blob.url))
      .filter(blob=>new Date(blob.uploadedAt||0).getTime()<now-EIGHT_DAYS)
      .map(blob=>blob.url);
    if(orphanUrls.length) await del(orphanUrls);
    return sendJson(res,200,{ok:true,expiredReports,orphanFiles:orphanUrls.length});
  }catch(error){
    console.error('Cleanup error',error);
    return sendJson(res,500,{error:'Автоочистка не завершилась.'});
  }
}
