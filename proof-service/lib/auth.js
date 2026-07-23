import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function adminApp(){
  if(getApps().length) return getApps()[0];
  return initializeApp({projectId:process.env.FIREBASE_PROJECT_ID||'rp-cabinet'});
}

export async function verifyFirebaseToken(token){
  if(!token) throw new Error('AUTH_REQUIRED');
  return getAuth(adminApp()).verifyIdToken(token,true);
}

export async function requireUser(req){
  const header=String(req.headers.authorization||'');
  const token=header.startsWith('Bearer ')?header.slice(7).trim():'';
  return verifyFirebaseToken(token);
}

export function isOwnedProofUrl(url,uid){
  try{
    const parsed=new URL(url);
    return parsed.protocol==='https:'
      && parsed.hostname.endsWith('.blob.vercel-storage.com')
      && decodeURIComponent(parsed.pathname).startsWith(`/proofs/${uid}/`);
  }catch(error){
    return false;
  }
}
