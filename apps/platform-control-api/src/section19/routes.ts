import type {FastifyInstance,FastifyRequest} from 'fastify';
import {ControlPlaneService} from './service.js';
export interface ControlActor {userId:string;roles:string[]}
export async function registerSection19Routes(app:FastifyInstance,service:ControlPlaneService,actor:(r:FastifyRequest)=>ControlActor,environment:string){
 app.get('/platform/capabilities',()=>service.capabilities(environment));
 app.get<{Params:{id:string}}>('/platform/capabilities/:id',async(req,reply)=>(await service.capabilities(environment)).find(x=>x.capabilityId===req.params.id)??reply.code(404).send({error:{code:'CAPABILITY_NOT_FOUND',requestId:req.id}}));
 app.get('/platform/dependencies',()=>service.dependencies(environment));
 app.get('/platform/health',()=>service.health(environment));
 app.get('/platform/drift',()=>service.drift(environment));
 app.get('/platform/config/versions',()=>service.configVersions(environment));
 app.post<{Body:{capability:string;oldState:Record<string,unknown>;desiredState:Record<string,unknown>;riskLevel:'GREEN'|'BLUE'|'AMBER'|'RED'|'LOCKED'}}>('/platform/changes',(req,reply)=>{const a=actor(req);return service.createChange({environment,requestedBy:a.userId,correlationId:req.id,...req.body}).then(x=>reply.code(201).send(x))});
 for(const action of ['validate','plan','approve','apply','rollback'] as const)app.post<{Params:{id:string}}>('/platform/changes/:id/'+action,(req)=>{const a=actor(req);const next={validate:'VALIDATING',plan:'IMPACT_ANALYSIS',approve:'APPROVED',apply:'PROVISIONING',rollback:'ROLLING_BACK'}[action] as any;return service.transition(req.params.id,next,a.userId,req.id)});
 app.get<{Params:{id:string}}>('/platform/changes/:id/status',async(req,reply)=>{const change=await service.changeStatus(req.params.id);return change??reply.code(404).send({error:{code:'CHANGE_NOT_FOUND',message:'Change request not found',requestId:req.id}})});
 app.post<{Params:{version:string}}>('/platform/config/:version/activate',(req)=>{const a=actor(req);return service.activateConfig(environment,Number(req.params.version),a.userId,req.id)});
}
