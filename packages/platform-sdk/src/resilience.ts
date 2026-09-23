export class TransientDependencyError extends Error{}
export class PermanentDependencyError extends Error{}
export class TimeoutError extends TransientDependencyError{}

export interface RetryOptions{attempts:number;baseMs:number;maxMs:number;timeoutMs?:number}
export async function withTimeout<T>(promise:Promise<T>,timeoutMs:number):Promise<T>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([promise,new Promise<T>((_,reject)=>{timer=setTimeout(()=>reject(new TimeoutError(`Timed out after ${timeoutMs}ms`)),timeoutMs)})])}
 finally{if(timer)clearTimeout(timer)}
}
export async function withRetry<T>(fn:()=>Promise<T>,opts:RetryOptions={attempts:3,baseMs:100,maxMs:2000}):Promise<T>{
 let last:unknown;
 for(let i=0;i<opts.attempts;i++){
  try{return opts.timeoutMs?await withTimeout(fn(),opts.timeoutMs):await fn()}
  catch(e){last=e;if(!(e instanceof TransientDependencyError)||i===opts.attempts-1)throw e;const cap=Math.min(opts.maxMs,opts.baseMs*2**i);await new Promise(r=>setTimeout(r,Math.floor(Math.random()*cap)))}
 }
 throw last
}
export class CircuitBreaker{
 private failures=0;private openedAt=0;
 constructor(private threshold=5,private resetMs=30000){}
 async run<T>(fn:()=>Promise<T>):Promise<T>{
  if(this.openedAt&&Date.now()-this.openedAt<this.resetMs)throw new TransientDependencyError('Circuit open');
  try{const v=await fn();this.failures=0;this.openedAt=0;return v}catch(e){if(++this.failures>=this.threshold)this.openedAt=Date.now();throw e}
 }
}
export class Bulkhead{
 private active=0;private waiters:Array<()=>void>=[];
 constructor(private readonly limit:number){if(limit<1)throw new Error('Bulkhead limit must be positive')}
 async run<T>(fn:()=>Promise<T>):Promise<T>{if(this.active>=this.limit)await new Promise<void>(r=>this.waiters.push(r));this.active++;try{return await fn()}finally{this.active--;this.waiters.shift()?.()}}
}
export interface IdempotencyStore{get(key:string):Promise<unknown|null>;put(key:string,value:unknown,ttlSeconds?:number):Promise<void>}
export async function idempotent<T>(store:IdempotencyStore,key:string,operation:()=>Promise<T>,ttlSeconds=86400):Promise<T>{
 const prior=await store.get(key);if(prior!==null)return prior as T;const value=await operation();await store.put(key,value,ttlSeconds);return value
}
export interface DeadLetterQueue{send(payload:unknown,reason:string,correlationId?:string):Promise<void>}
export async function processWithDlq<T>(work:()=>Promise<T>,dlq:DeadLetterQueue,payload:unknown,correlationId?:string):Promise<T|undefined>{
 try{return await work()}catch(e){await dlq.send(payload,e instanceof Error?e.message:'unknown error',correlationId);return undefined}
}
export type DependencyHealth={name:string;required:boolean;healthy:boolean;degraded:boolean;fallback?:string}
export function readiness(deps:DependencyHealth[]){const failedRequired=deps.filter(d=>d.required&&!d.healthy);return {ready:failedRequired.length===0,state:failedRequired.length?'UNAVAILABLE':deps.some(d=>!d.healthy||d.degraded)?'DEGRADED':'HEALTHY',dependencies:deps}}
export class GracefulShutdown{
 private stopping=false;private hooks:Array<()=>Promise<void>>=[];
 register(hook:()=>Promise<void>){this.hooks.push(hook)}
 isStopping(){return this.stopping}
 async shutdown(){if(this.stopping)return;this.stopping=true;for(const hook of this.hooks)await hook()}
}
export interface RollbackGate{verify():Promise<boolean>;rollback(reason:string):Promise<void>}
export async function verifyOrRollback(gate:RollbackGate,reason='health/SLO verification failed'){if(!(await gate.verify())){await gate.rollback(reason);return false}return true}
