import { list } from '@vercel/blob';

export const REPORT_LIFETIME_MS=8*24*60*60*1000;

export async function findReportBlob(id){
  if(!/^[a-f0-9]{36}$/i.test(String(id||''))) return null;
  const result=await list({prefix:`reports/${id}/manifest.json`,limit:1});
  return result.blobs?.[0]||null;
}

export async function readReport(id){
  const blob=await findReportBlob(id);
  if(!blob) return {blob:null,manifest:null};
  const response=await fetch(blob.url,{cache:'no-store'});
  if(!response.ok) return {blob,manifest:null};
  return {blob,manifest:await response.json()};
}

export async function listAll(prefix){
  const blobs=[];
  let cursor;
  do{
    const page=await list({prefix,limit:1000,...(cursor?{cursor}:{})});
    blobs.push(...(page.blobs||[]));
    cursor=page.hasMore?page.cursor:undefined;
  }while(cursor);
  return blobs;
}
