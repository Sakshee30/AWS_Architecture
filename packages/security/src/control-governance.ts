export type PlatformRole='Viewer'|'Developer'|'Operator'|'DevOps'|'Security Admin'|'Approver'|'Platform Admin';
export const grants:Record<PlatformRole,string[]>={
 Viewer:['read:health','read:config','read:deployments','read:costs'],Developer:['change:dev-safe'],Operator:['restart','redeploy'],DevOps:['change:infrastructure'],'Security Admin':['manage:security'],'Approver':['approve:production'],'Platform Admin':['govern:platform']
};
export type MaintenanceScope={kind:'platform'|'tenant'|'workspace'|'service'|'feature';id?:string};
export interface EmergencyState{disableSignups:boolean;disableUploads:boolean;disableAI:boolean;disableInboundWebhooks:boolean;disableOutboundIntegrations:boolean;readOnly:boolean;maintenance?:MaintenanceScope}
export function can(role:PlatformRole,permission:string){return grants[role]?.includes(permission)??false}
export function assertProductionApproval(requestedBy:string,approvedBy:string|undefined){if(!approvedBy)throw new Error('Production approval required');if(requestedBy===approvedBy)throw new Error('Requestor and approver must differ for production-critical changes')}
