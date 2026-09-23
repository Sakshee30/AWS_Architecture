import {createHmac,timingSafeEqual} from 'node:crypto';

export const SECURITY_HEADERS:Record<string,string>={
 'strict-transport-security':'max-age=31536000; includeSubDomains',
 'x-content-type-options':'nosniff',
 'referrer-policy':'strict-origin-when-cross-origin',
 'permissions-policy':'camera=(), microphone=(), geolocation=()',
 'content-security-policy':"default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'"
};

function forbiddenHostname(host:string):boolean{
 const h=host.toLowerCase();
 if(h==='localhost'||h.endsWith('.local'))return true;
 if(/^127\./.test(h)||/^0\./.test(h)||/^10\./.test(h)||/^192\.168\./.test(h)||/^169\.254\./.test(h))return true;
 const m=h.match(/^172\.(\d+)\./); if(m&&Number(m[1])>=16&&Number(m[1])<=31)return true;
 if(h==='::1'||h.startsWith('fc')||h.startsWith('fd')||h.startsWith('fe80:'))return true;
 return false;
}

export function assertSafeOutboundUrl(raw:string,allowedHosts:string[]):URL{
 const url=new URL(raw);
 if(url.protocol!=='https:')throw Object.assign(new Error('Only HTTPS outbound URLs are allowed'),{code:'UNSAFE_OUTBOUND_URL'});
 const host=url.hostname.toLowerCase();
 if(forbiddenHostname(host))throw Object.assign(new Error('Private/link-local destinations are forbidden'),{code:'SSRF_DESTINATION_FORBIDDEN'});
 if(!allowedHosts.map(x=>x.toLowerCase()).some(x=>host===x||host.endsWith('.'+x)))throw Object.assign(new Error('Outbound host is not allow-listed'),{code:'OUTBOUND_HOST_NOT_ALLOWED'});
 return url;
}

export function verifySignedWebhook(input:{rawBody:string;signature:string;timestamp:string;secret:string;maxAgeSeconds?:number;nowMs?:number}):void{
 const now=input.nowMs??Date.now(),ts=Number(input.timestamp);
 if(!Number.isFinite(ts)||Math.abs(now-ts*1000)>(input.maxAgeSeconds??300)*1000)throw Object.assign(new Error('Webhook timestamp outside replay window'),{code:'WEBHOOK_REPLAY_REJECTED'});
 const expected=createHmac('sha256',input.secret).update(input.timestamp+'.'+input.rawBody).digest('hex');
 const supplied=input.signature.replace(/^sha256=/,'');
 const a=Buffer.from(expected,'hex'),b=Buffer.from(supplied,'hex');
 if(a.length!==b.length||!timingSafeEqual(a,b))throw Object.assign(new Error('Webhook signature invalid'),{code:'WEBHOOK_SIGNATURE_INVALID'});
}

const SECRET_KEYS=/password|authorization|cookie|token|secret|api[-_]?key|payment|document.?content/i;
export function redactSensitive(value:unknown):unknown{
 if(Array.isArray(value))return value.map(redactSensitive);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([k,v])=>[k,SECRET_KEYS.test(k)?'[REDACTED]':redactSensitive(v)]));
 return value;
}
