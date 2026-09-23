import {createHmac,timingSafeEqual} from 'node:crypto';
export interface WebhookVerificationInput {rawBody:Buffer;signature:string;timestamp:string;secret:string;nowMs?:number;toleranceSeconds?:number}
export function verifySignedWebhook(input:WebhookVerificationInput):void{
 const now=input.nowMs??Date.now(),tol=(input.toleranceSeconds??300)*1000,ts=Number(input.timestamp)*1000;
 if(!Number.isFinite(ts)||Math.abs(now-ts)>tol)throw Object.assign(new Error('Webhook timestamp outside replay window'),{code:'WEBHOOK_REPLAY_REJECTED'});
 const expected=createHmac('sha256',input.secret).update(`${input.timestamp}.`).update(input.rawBody).digest('hex');
 const actual=input.signature.replace(/^sha256=/,'');
 if(actual.length!==expected.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))throw Object.assign(new Error('Invalid webhook signature'),{code:'WEBHOOK_SIGNATURE_INVALID'});
}
export function assertSafeOutboundUrl(value:string,allowedHosts:string[]):URL{
 const url=new URL(value);if(url.protocol!=='https:')throw Object.assign(new Error('Only HTTPS outbound URLs are allowed'),{code:'UNSAFE_OUTBOUND_URL'});
 if(!allowedHosts.includes(url.hostname))throw Object.assign(new Error('Outbound host is not allow-listed'),{code:'UNSAFE_OUTBOUND_HOST'});
 if(/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.)/.test(url.hostname))throw Object.assign(new Error('Private/link-local destinations are forbidden'),{code:'SSRF_DESTINATION_FORBIDDEN'});
 return url;
}
