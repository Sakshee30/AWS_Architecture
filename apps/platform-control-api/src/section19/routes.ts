import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Environment } from '../../../../packages/policy-engine/src/index.js';
import { evaluatePlatformPolicy } from '../../../../packages/policy-engine/src/index.js';
import { validatePlatformState } from '../../../../packages/config-engine/src/index.js';
import type { DesiredState } from '../../../../packages/config-engine/src/index.js';
import { ControlPlaneService } from './service.js';

export interface ControlActor { userId:string; roles:string[]; }

export async function registerSection19Routes(
  app:FastifyInstance,
  service:ControlPlaneService,
  actor:(r:FastifyRequest)=>ControlActor,
  environment:Environment,
){
  app.get('/platform/capabilities',()=>service.capabilities(environment));
  app.get<{Params:{id:string}}>('/platform/capabilities/:id',async(req,reply)=>{
    const item=(await service.capabilities(environment)).find(x=>x.capabilityId===req.params.id);
    return item??reply.code(404).send({error:{code:'CAPABILITY_NOT_FOUND',message:'Capability not found',requestId:req.id}});
  });
  app.get('/platform/dependencies',()=>service.dependencies(environment));
  app.get('/platform/health',()=>service.health(environment));
  app.get('/platform/drift',()=>service.drift(environment));
  app.get('/platform/config/versions',()=>service.configVersions(environment));
  app.get<{Params:{id:string}}>('/platform/changes/:id/status',async(req,reply)=>{
    const change=await service.getChange(req.params.id);
    return change??reply.code(404).send({error:{code:'CHANGE_NOT_FOUND',message:'Change not found',requestId:req.id}});
  });
  app.post<{Body:{capability:string;oldState:Record<string,unknown>;desiredState:Record<string,unknown>;riskLevel:'GREEN'|'BLUE'|'AMBER'|'RED'|'LOCKED'}}>('/platform/changes',async(req,reply)=>{
    const a=actor(req);
    return reply.code(201).send(await service.createChange({environment,requestedBy:a.userId,correlationId:req.id,...req.body}));
  });
  app.post<{Params:{id:string};Body?:{desiredState?:DesiredState}}>('/platform/changes/:id/validate',async(req)=>{
    if(req.body?.desiredState){
      const result=validatePlatformState(req.body.desiredState,environment);
      if(!result.valid)throw Object.assign(new Error('Desired state validation failed'),{statusCode:409,code:'INVALID_DESIRED_STATE',details:result});
    }
    const a=actor(req);return service.transition(req.params.id,'VALIDATING',a.userId,req.id);
  });
  app.post<{Params:{id:string}}>('/platform/changes/:id/plan',async(req)=>{const a=actor(req);return service.transition(req.params.id,'IMPACT_ANALYSIS',a.userId,req.id)});
  app.post<{Params:{id:string}}>('/platform/changes/:id/approve',async(req)=>{
    const a=actor(req);const change=await service.requireChange(req.params.id);
    const switchClass=change.riskLevel==='RED'?'compute-migration':change.riskLevel==='AMBER'?'infrastructure':'application-provider';
    const policy=evaluatePlatformPolicy({environment,actorRoles:a.roles,switchClass,operation:'change-provider',capability:change.capability,approved:true});
    if(!policy.allowed)throw Object.assign(new Error(policy.reasons.join(',')),{statusCode:403,code:'POLICY_REJECTED'});
    return service.transition(req.params.id,'APPROVED',a.userId,req.id);
  });
  app.post<{Params:{id:string}}>('/platform/changes/:id/apply',async(req)=>{const a=actor(req);return service.transition(req.params.id,'PROVISIONING',a.userId,req.id)});
  app.post<{Params:{id:string}}>('/platform/changes/:id/rollback',async(req)=>{const a=actor(req);return service.transition(req.params.id,'ROLLING_BACK',a.userId,req.id)});
  app.post<{Params:{version:string}}>('/platform/config/:version/activate',async(req)=>{const a=actor(req);return service.activateConfig(environment,Number(req.params.version),a.userId,req.id)});
}
