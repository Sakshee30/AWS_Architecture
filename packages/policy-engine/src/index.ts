import type {DesiredState,SwitchClass} from '../../config-engine/src/index.js';
export type Environment='development'|'testing'|'staging'|'production';
export const LOCKED_PRODUCTION_CAPABILITIES=['authentication','authorization','tenant_isolation','primary_persistent_datastore','tls_encryption','secure_secret_handling','sensitive_operation_audit','structured_logging','input_validation','backup_policy','database_migration_system','configuration_validation'] as const;
const aliases:Record<string,string>={auth:'authentication',database:'primary_persistent_datastore',postgres:'primary_persistent_datastore',postgresql:'primary_persistent_datastore',tls:'tls_encryption',encryption:'tls_encryption',secrets:'secure_secret_handling',audit:'sensitive_operation_audit',logging:'structured_logging',validation:'input_validation',backup:'backup_policy',migrations:'database_migration_system',config_validation:'configuration_validation'};
export function canonicalCapabilityName(v:string){return v.trim().toLowerCase().replace(/[\s.-]+/g,'_')}
export function isLockedProductionCapability(v:string){const c=canonicalCapabilityName(v);return LOCKED_PRODUCTION_CAPABILITIES.includes((aliases[c]??c) as never)}
export interface PolicyContext{environment:Environment;actorRoles:string[];switchClass:SwitchClass;operation:'enable'|'disable'|'change-provider'|'stop'|'destroy';capability:string;approved?:boolean}
export function evaluatePlatformPolicy(c:PolicyContext){const reasons:string[]=[];const production=c.environment==='production';const privileged=c.actorRoles.some(r=>['platform-admin','sre','security-admin','devops'].includes(r));if(!privileged)reasons.push('PLATFORM_ADMIN_ROLE_REQUIRED');if(production&&['disable','stop','destroy'].includes(c.operation)&&isLockedProductionCapability(c.capability))reasons.push('LOCKED_PRODUCTION_CAPABILITY');const approvalRequired=production&&['application-provider','infrastructure','compute-migration'].includes(c.switchClass);if(approvalRequired&&!c.approved)reasons.push('PRODUCTION_APPROVAL_REQUIRED');if(c.operation==='destroy'&&c.switchClass==='runtime')reasons.push('RUNTIME_SWITCH_CANNOT_DESTROY_INFRASTRUCTURE');return{allowed:reasons.length===0,reasons,approvalRequired}}
export function assertLockedState(state:DesiredState,environment:Environment):void{if(environment!=='production')return;const violations:string[]=[];if(!state.platform.database.enabled)violations.push('primary_persistent_datastore');if(!state.platform.observability.logging)violations.push('structured_logging');if(violations.length)throw new Error(`Locked production capabilities disabled: ${violations.join(', ')}`)}

export function lockedProductionCapability(v:string):string|false{
 const c=canonicalCapabilityName(v);
 const canonical=aliases[c]??c;
 return LOCKED_PRODUCTION_CAPABILITIES.includes(canonical as never)?canonical:false;
}
