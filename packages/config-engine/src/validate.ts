import type {CapabilitySelection,DesiredState} from './types.js';
const providers:Record<string,ReadonlySet<string>>={
 database:new Set(['postgres']),
 cache:new Set(['redis','memory','none']),
 distributed_lock:new Set(['redis','postgres']),
 idempotency:new Set(['redis','postgres']),
 queue:new Set(['sqs','bullmq','rabbitmq','sync']),
 event_bus:new Set(['kafka','sns-sqs','outbox']),
 object_storage:new Set(['s3','minio','filesystem']),
 vector_store:new Set(['pgvector','disabled']),
 search:new Set(['opensearch','postgres']),
 ai:new Set(['local-ai','bedrock','external','disabled'])
};
const fallbackProviders:Record<string,ReadonlySet<string>>={
 cache:new Set(['redis','memory','none']),
 distributed_lock:new Set(['redis','postgres']),
 idempotency:new Set(['redis','postgres']),
 queue:new Set(['sqs','bullmq','rabbitmq','sync']),
 event_bus:new Set(['kafka','sns-sqs','outbox']),
 object_storage:new Set(['s3','minio','filesystem']),
 search:new Set(['opensearch','postgres']),
 ai:new Set(['local-ai','bedrock','external','disabled'])
};
export interface ValidationIssue{path:string;code:string;message:string}
function sel(v:unknown):CapabilitySelection|undefined{if(!v||typeof v!=='object')return;const x=v as Partial<CapabilitySelection>;if(typeof x.enabled!=='boolean'||typeof x.provider!=='string'||!x.provider)return;return x as CapabilitySelection}
export function validateDesiredState(state:DesiredState):ValidationIssue[]{
 const issues:ValidationIssue[]=[];if(!state?.platform||!state?.features)return[{path:'$',code:'INVALID_SHAPE',message:'Desired state must contain platform and features.'}];
 const p=state.platform as unknown as Record<string,unknown>;
 for(const [name,allowed] of Object.entries(providers)){const s=sel(p[name]);if(!s){issues.push({path:`platform.${name}`,code:'MISSING_CAPABILITY',message:`Missing or malformed capability ${name}`});continue}if(!allowed.has(s.provider))issues.push({path:`platform.${name}.provider`,code:'INVALID_PROVIDER',message:`Unsupported provider ${s.provider}`});if(s.required&&!s.enabled)issues.push({path:`platform.${name}.enabled`,code:'REQUIRED_DISABLED',message:`${name} is required`});if(s.enabled&&fallbackProviders[name]&&!s.fallback)issues.push({path:`platform.${name}.fallback`,code:'MISSING_FALLBACK',message:`Enabled ${name} requires fallback/degraded mode`});if(s.fallback&&fallbackProviders[name]&&!fallbackProviders[name]!.has(s.fallback))issues.push({path:`platform.${name}.fallback`,code:'INVALID_FALLBACK',message:`Unsupported fallback ${s.fallback}`})}
 const db=sel(p.database),storage=sel(p.object_storage),ai=sel(p.ai),vector=sel(p.vector_store),cache=sel(p.cache),queue=sel(p.queue),lock=sel(p.distributed_lock),idem=sel(p.idempotency);
 if(!db?.enabled||db.provider!=='postgres')issues.push({path:'platform.database',code:'LOCKED_DATABASE',message:'Primary PostgreSQL database is required.'});
 if(!storage?.enabled)issues.push({path:'platform.object_storage.enabled',code:'CORE_CAPABILITY_DISABLED',message:'Object storage must be active.'});
 if(!state.platform.observability?.logging)issues.push({path:'platform.observability.logging',code:'LOCKED_LOGGING',message:'Structured logging cannot be disabled.'});
 if(state.features.rag&&(!ai?.enabled||!vector?.enabled||!storage?.enabled))issues.push({path:'features.rag',code:'RAG_DEPENDENCY',message:'RAG requires AI, vector_store and object_storage.'});
 if(queue?.enabled&&queue.provider==='bullmq'&&!(cache?.enabled&&cache.provider==='redis'))issues.push({path:'platform.queue.provider',code:'BULLMQ_REQUIRES_REDIS',message:'BullMQ requires Redis.'});
 if(lock?.enabled&&lock.provider==='redis'&&!(cache?.enabled&&cache.provider==='redis'))issues.push({path:'platform.distributed_lock.provider',code:'REDIS_LOCK_REQUIRES_REDIS',message:'Redis lock provider requires Redis.'});
 if(idem?.enabled&&idem.provider==='redis'&&!(cache?.enabled&&cache.provider==='redis'))issues.push({path:'platform.idempotency.provider',code:'REDIS_IDEMPOTENCY_REQUIRES_REDIS',message:'Redis idempotency provider requires Redis.'});
 return issues;
}
