export type Environment='development'|'testing'|'staging'|'production';
export type SwitchClass='runtime'|'application-provider'|'infrastructure'|'compute-migration'|'locked';
const locked=new Set(['authentication','authorization','tenant_isolation','primary_persistent_datastore','tls_encryption','secure_secret_handling','sensitive_operation_audit','structured_logging','input_validation','backup_policy','database_migration_system','configuration_validation']);
const aliases:Record<string,string>={auth:'authentication',database:'primary_persistent_datastore',postgres:'primary_persistent_datastore',tls:'tls_encryption',encryption:'tls_encryption',secrets:'secure_secret_handling',audit:'sensitive_operation_audit',logging:'structured_logging',backup:'backup_policy',migrations:'database_migration_system',validation:'configuration_validation'};
export function canonicalCapabilityName(v:string){return v.trim().toLowerCase().replace(/[\s.-]+/g,'_')}
export function isLockedProductionCapability(v:string){const c=canonicalCapabilityName(v);return locked.has(aliases[c]??c)}
export function evaluatePlatformPolicy(ctx:{environment:Environment;actorRoles:string[];switchClass:SwitchClass;operation:'enable'|'disable'|'change-provider'|'stop'|'destroy';capability:string;approved?:boolean}){
 const reasons:string[]=[];const production=ctx.environment==='production';const privileged=ctx.actorRoles.some(r=>['platform-admin','sre','security-admin','devops'].includes(r));
 if(!privileged)reasons.push('PLATFORM_ADMIN_ROLE_REQUIRED');
 if(production&&['disable','stop','destroy'].includes(ctx.operation)&&isLockedProductionCapability(ctx.capability))reasons.push('LOCKED_PRODUCTION_CAPABILITY');
 const approvalRequired=production&&['application-provider','infrastructure','compute-migration'].includes(ctx.switchClass);
 if(approvalRequired&&!ctx.approved)reasons.push('PRODUCTION_APPROVAL_REQUIRED');
 if(ctx.operation==='destroy'&&ctx.switchClass==='runtime')reasons.push('RUNTIME_SWITCH_CANNOT_DESTROY_INFRASTRUCTURE');
 return{allowed:reasons.length===0,reasons,approvalRequired};
}
