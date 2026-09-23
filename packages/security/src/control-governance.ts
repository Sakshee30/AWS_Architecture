export type PlatformRole='Viewer'|'Developer'|'Operator'|'DevOps'|'Security Admin'|'Approver'|'Platform Admin';
export const grants:Record<PlatformRole,string[]>={
 Viewer:['read:health','read:config','read:deployments','read:costs'],
 Developer:['change:dev-safe'],
 Operator:['restart','redeploy'],
 DevOps:['change:infrastructure'],
 'Security Admin':['manage:security','read:security-findings'],
 Approver:['approve:production'],
 'Platform Admin':['govern:platform','change:platform-config']
};

export type MaintenanceScope={kind:'platform'|'tenant'|'workspace'|'service'|'feature';id?:string};
export type EmergencyControl='disable_signups'|'disable_file_uploads'|'disable_ai'|'disable_external_webhook_processing'|'disable_outbound_integrations'|'read_only'|'maintenance_mode';

export interface EmergencyState{
 disableSignups:boolean;
 disableUploads:boolean;
 disableAI:boolean;
 disableInboundWebhooks:boolean;
 disableOutboundIntegrations:boolean;
 readOnly:boolean;
 maintenance?:MaintenanceScope;
}

export interface GovernanceAuditRecord{
 actor:string;
 action:string;
 environment:string;
 oldValue?:unknown;
 desiredValue?:unknown;
 reason:string;
 ticketReference?:string;
 approval?:{approvedBy:string;approvedAt:string};
 execution?:{executionId:string;result:string};
 sourceSession:string;
 rollbackChangeId?:string;
 occurredAt:string;
}

export function can(role:PlatformRole,permission:string){return grants[role]?.includes(permission)??false}

export function assertProductionApproval(requestedBy:string,approvedBy:string|undefined){
 if(!approvedBy)throw Object.assign(new Error('Production approval required'),{code:'PRODUCTION_APPROVAL_REQUIRED'});
 if(requestedBy===approvedBy)throw Object.assign(new Error('Requestor and approver must differ for production-critical changes'),{code:'SEPARATION_OF_DUTIES'});
}

export function assertMaintenanceScope(scope:MaintenanceScope){
 if(scope.kind!=='platform'&&!scope.id)throw Object.assign(new Error(`${scope.kind} maintenance requires a scope id`),{code:'MAINTENANCE_SCOPE_REQUIRED'});
}

export function applyEmergencyControl(state:EmergencyState,control:EmergencyControl,enabled:boolean,scope?:MaintenanceScope):EmergencyState{
 const next={...state};
 switch(control){
  case 'disable_signups': next.disableSignups=enabled; break;
  case 'disable_file_uploads': next.disableUploads=enabled; break;
  case 'disable_ai': next.disableAI=enabled; break;
  case 'disable_external_webhook_processing': next.disableInboundWebhooks=enabled; break;
  case 'disable_outbound_integrations': next.disableOutboundIntegrations=enabled; break;
  case 'read_only': next.readOnly=enabled; break;
  case 'maintenance_mode':
   if(enabled){if(!scope)throw Object.assign(new Error('Maintenance scope required'),{code:'MAINTENANCE_SCOPE_REQUIRED'});assertMaintenanceScope(scope);next.maintenance=scope}else delete next.maintenance;
   break;
 }
 return next;
}
