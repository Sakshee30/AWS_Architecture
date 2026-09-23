import type {DesiredState,Environment} from './types.js';
const providers={
 database:['postgres'],cache:['redis','memory','none'],distributed_lock:['redis','postgres'],idempotency:['redis','postgres'],queue:['sqs','bullmq','rabbitmq','sync'],event_bus:['kafka','sns-sqs','outbox'],object_storage:['s3','minio','filesystem'],vector_store:['pgvector','disabled'],search:['opensearch','postgres'],ai:['local-ai','bedrock','external','disabled']
} as const;
export function validatePlatformState(state:DesiredState,environment:Environment){
 const issues:string[]=[];const p=state?.platform as unknown as Record<string,{enabled?:boolean;provider?:string;fallback?:string}>;
 if(!state?.platform?.database?.enabled||state.platform.database.provider!=='postgres')issues.push('PRIMARY_DATABASE_REQUIRED');
 for(const [name,allowed] of Object.entries(providers)){const sel=p[name];if(!sel)issues.push(`MISSING_${name.toUpperCase()}`);else if(sel.provider&&!allowed.includes(sel.provider as never))issues.push(`INVALID_PROVIDER_${name.toUpperCase()}`)}
 if(state.features?.rag&&(!p.ai?.enabled||!p.vector_store?.enabled||!p.object_storage?.enabled))issues.push('RAG_DEPENDENCY_CONFLICT');
 if(p.queue?.enabled&&p.queue.provider==='bullmq'&&!(p.cache?.enabled&&p.cache.provider==='redis'))issues.push('BULLMQ_REQUIRES_REDIS');
 if(p.distributed_lock?.enabled&&p.distributed_lock.provider==='redis'&&!(p.cache?.enabled&&p.cache.provider==='redis'))issues.push('REDIS_LOCK_REQUIRES_REDIS');
 if(p.idempotency?.enabled&&p.idempotency.provider==='redis'&&!(p.cache?.enabled&&p.cache.provider==='redis'))issues.push('REDIS_IDEMPOTENCY_REQUIRES_REDIS');
 if(environment==='production'&&!state.platform.observability.logging)issues.push('STRUCTURED_LOGGING_LOCKED_IN_PRODUCTION');
 return{valid:issues.length===0,issues};
}
