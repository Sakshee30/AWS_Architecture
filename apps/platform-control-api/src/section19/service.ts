import {randomUUID} from 'node:crypto';
import type {ControlPlaneRepository} from './repository.js';
import type {PlatformChange,RiskLevel,AuditEvent} from './types.js';
const transitions:Record<string,string[]>={
DRAFT:['VALIDATING'],VALIDATING:['IMPACT_ANALYSIS','FAILED'],IMPACT_ANALYSIS:['WAITING_APPROVAL','APPROVED','FAILED'],WAITING_APPROVAL:['APPROVED','FAILED'],APPROVED:['PROVISIONING','DEPLOYING','FAILED'],PROVISIONING:['DEPLOYING','FAILED'],DEPLOYING:['VERIFYING','FAILED'],VERIFYING:['STABILIZING','FAILED'],STABILIZING:['COMPLETED','FAILED'],FAILED:['ROLLING_BACK'],ROLLING_BACK:['ROLLED_BACK']
};
export class ControlPlaneService {
 constructor(private readonly repo:ControlPlaneRepository){}
 capabilities(env:string){return this.repo.listCapabilities(env)}
 dependencies(env:string){return this.repo.listDependencies(env)}
 configVersions(env:string){return this.repo.listConfigVersions(env)}
 async health(env:string){const providers=await this.repo.providerHealth(env);return{environment:env,state:providers.some(p=>p.state==='UNHEALTHY')?'DEGRADED':'HEALTHY',providers}}
 async drift(env:string){const items=await this.repo.listCapabilities(env);const drift=items.filter(x=>JSON.stringify(x.desiredState)!==JSON.stringify(x.actualState));return{environment:env,status:drift.length?'DRIFT':'NONE',items:drift.map(x=>({capabilityId:x.capabilityId,name:x.name,desiredState:x.desiredState,actualState:x.actualState}))}}
 async createChange(input:{environment:string;requestedBy:string;capability:string;oldState:Record<string,unknown>;desiredState:Record<string,unknown>;riskLevel:RiskLevel;correlationId:string}){
  if(input.riskLevel==='LOCKED')throw Object.assign(new Error('Locked capabilities cannot be changed'),{statusCode:409,code:'LOCKED_CAPABILITY'});
  const now=new Date().toISOString();const change:PlatformChange={changeId:randomUUID(),requestedAt:now,status:'DRAFT',...input};
  await this.repo.saveChange(change);await this.audit(input.requestedBy,'change.create',change.changeId,input.environment,input.correlationId,'SUCCESS',input.oldState,input.desiredState);return change;
 }
 async transition(id:string,next:PlatformChange['status'],actor:string,correlationId:string){
  const change=await this.repo.getChange(id);if(!change)throw Object.assign(new Error('Change not found'),{statusCode:404,code:'CHANGE_NOT_FOUND'});
  if(!(transitions[change.status]??[]).includes(next))throw Object.assign(new Error(`Invalid transition ${change.status} -> ${next}`),{statusCode:409,code:'INVALID_CHANGE_TRANSITION'});
  if(next==='APPROVED'&&change.environment==='production'&&actor===change.requestedBy)throw Object.assign(new Error('Production requestor cannot self-approve'),{statusCode:403,code:'SEPARATION_OF_DUTIES'});
  const updated={...change,status:next,approvedBy:next==='APPROVED'?actor:change.approvedBy,startedAt:['PROVISIONING','DEPLOYING'].includes(next)?new Date().toISOString():change.startedAt,completedAt:['COMPLETED','ROLLED_BACK'].includes(next)?new Date().toISOString():change.completedAt};
  await this.repo.saveChange(updated);await this.audit(actor,`change.${next.toLowerCase()}`,id,change.environment,correlationId,'SUCCESS',change,updated);return updated;
 }
 async activateConfig(environment:string,version:number,actor:string,correlationId:string){await this.repo.activateConfigVersion(environment,version);await this.audit(actor,'config.activate',String(version),environment,correlationId,'SUCCESS');}
 private audit(actor:string,action:string,resource:string,environment:string,correlationId:string,result:string,oldValue?:unknown,newValue?:unknown){const event:AuditEvent={actor,action,resource,environment,correlationId,result,timestamp:new Date().toISOString(),oldValue,newValue};return this.repo.appendAudit(event)}
}
