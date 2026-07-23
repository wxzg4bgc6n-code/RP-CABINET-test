export function applyCors(req,res){
  const origin=String(req.headers.origin||'');
  const allowed=String(process.env.ALLOWED_ORIGINS||'')
    .split(',')
    .map(value=>value.trim())
    .filter(Boolean);
  const allowOrigin=!origin || allowed.includes('*') || allowed.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    ? (origin||'*')
    : (allowed[0]||'*');
  res.setHeader('Access-Control-Allow-Origin',allowOrigin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Authorization,Content-Type');
  res.setHeader('Cache-Control','no-store');
  if(req.method==='OPTIONS'){
    res.status(204).end();
    return true;
  }
  return false;
}

export function readJsonBody(req){
  if(req.body&&typeof req.body==='object') return req.body;
  if(typeof req.body==='string'){
    try{return JSON.parse(req.body);}catch(error){return null;}
  }
  return null;
}

export function sendJson(res,status,payload){
  res.status(status).json(payload);
}

export function cleanText(value,max=180){
  return String(value??'').trim().slice(0,max);
}
