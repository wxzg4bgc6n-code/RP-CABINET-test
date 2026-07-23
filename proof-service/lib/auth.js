const FIREBASE_WEB_API_KEY=process.env.FIREBASE_WEB_API_KEY||'AIzaSyAIOHZIBi2l5aOiivO1q6LlVRXFjicQrhI';
const FIREBASE_LOOKUP_URL=`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`;

export async function verifyFirebaseToken(token){
  if(!token) throw new Error('AUTH_REQUIRED');
  const response=await fetch(FIREBASE_LOOKUP_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({idToken:String(token)})
  });
  const payload=await response.json().catch(()=>({}));
  const user=Array.isArray(payload.users)?payload.users[0]:null;
  if(!response.ok || !user?.localId) throw new Error('INVALID_FIREBASE_TOKEN');
  return {
    uid:user.localId,
    email:String(user.email||''),
    emailVerified:user.emailVerified===true
  };
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
