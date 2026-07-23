import { del } from '@vercel/blob';
import { isOwnedProofUrl, requireUser } from '../../lib/auth.js';
import { applyCors, readJsonBody, sendJson } from '../../lib/http.js';

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method!=='POST') return sendJson(res,405,{error:'Метод не поддерживается.'});
  try{
    const user=await requireUser(req);
    const body=readJsonBody(req)||{};
    if(!isOwnedProofUrl(body.url,user.uid)) return sendJson(res,403,{error:'Этот файл не принадлежит профилю.'});
    await del(body.url);
    return sendJson(res,200,{ok:true});
  }catch(error){
    console.error('Proof delete error',error);
    return sendJson(res,401,{error:'Не удалось подтвердить владельца файла.'});
  }
}
