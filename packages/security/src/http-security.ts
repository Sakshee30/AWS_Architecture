export const securityHeaders={
 'strict-transport-security':'max-age=31536000; includeSubDomains; preload',
 'x-content-type-options':'nosniff',
 'referrer-policy':'strict-origin-when-cross-origin',
 'permissions-policy':'camera=(), microphone=(), geolocation=()',
 'content-security-policy':"default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'"
} as const;
export function publicError(requestId:string,code='INTERNAL_ERROR',status=500){return{status,body:{error:{code,message:status>=500?'Request failed':'Request rejected',requestId}}}}
