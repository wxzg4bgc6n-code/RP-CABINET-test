import { handleUpload } from '@vercel/blob/client';
import { verifyFirebaseToken } from '../lib/auth.js';
import { applyCors, readJsonBody, sendJson } from '../lib/http.js';

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method!=='POST') return sendJson(res,405,{error:'Метод не поддерживается.'});
  try{
    const body=readJsonBody(req);
    if(!body) return sendJson(res,400,{error:'Некорректный запрос загрузки.'});
    const result=await handleUpload({
      body,
      request:req,
      onBeforeGenerateToken:async(pathname,clientPayload)=>{
        let payload;
        try{payload=JSON.parse(clientPayload||'{}');}catch(error){throw new Error('INVALID_CLIENT_PAYLOAD');}
        const decoded=await verifyFirebaseToken(payload.firebaseToken);
        const expectedPrefix=`proofs/${decoded.uid}/drafts/`;
        if(!String(pathname||'').startsWith(expectedPrefix)) throw new Error('INVALID_UPLOAD_PATH');
        return {
          allowedContentTypes:['image/png','image/jpeg','image/webp'],
          maximumSizeInBytes:15*1024*1024,
          addRandomSuffix:true,
          tokenPayload:JSON.stringify({
            uid:decoded.uid,
            contextKey:String(payload.contextKey||'').slice(0,500),
            task:String(payload.task||'').slice(0,500)
          })
        };
      },
      onUploadCompleted:async()=>{}
    });
    return sendJson(res,200,result);
  }catch(error){
    console.error('Upload token error',error);
    return sendJson(res,400,{error:'Загрузка отклонена. Обнови вход Google и попробуй снова.'});
  }
}
