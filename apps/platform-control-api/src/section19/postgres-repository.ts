import type {ControlPlaneRepository} from './repository.js';
import type {PlatformCapability,CapabilityDependency,PlatformChange,ConfigurationVersion,ProviderHealth,AuditEvent} from './types.js';

export interface SqlExecutor {
  query<T=unknown>(sql:string, params?:unknown[]):Promise<{rows:T[]}>;
}

const c=(r:any):PlatformCapability=>({capabilityId:r.capability_id,name:r.name,type:r.type,criticality:r.criticality,enabled:r.enabled,desiredState:r.desired_state??{},actualState:r.actual_state??{},provider:r.provider??undefined,fallbackProvider:r.fallback_provider??undefined,health:r.health,environment:r.environment,version:Number(r.version)});
const d=(r:any):CapabilityDependency=>({capabilityId:r.capability_id,dependsOn:r.depends_on,dependencyType:r.dependency_type,required:r.required,fallbackCapability:r.fallback_capability??undefined});
const ch=(r:any):PlatformChange=>({changeId:r.change_id,environment:r.environment,requestedBy:r.requested_by,requestedAt:new Date(r.requested_at).toISOString(),capability:r.capability,oldState:r.old_state??{},desiredState:r.desired_state??{},riskLevel:r.risk_level,status:r.status,impact:r.impact??undefined,approvedBy:r.approved_by??undefined,startedAt:r.started_at?new Date(r.started_at).toISOString():undefined,completedAt:r.completed_at?new Date(r.completed_at).toISOString():undefined,rollbackChangeId:r.rollback_change_id??undefined});
const cfg=(r:any):ConfigurationVersion=>({version:Number(r.version),environment:r.environment,configuration:r.configuration??{},createdBy:r.created_by,createdAt:new Date(r.created_at).toISOString(),active:r.active});
const ph=(r:any):ProviderHealth=>({provider:r.provider,environment:r.environment,state:r.state,lastCheck:new Date(r.last_check).toISOString(),latency:r.latency??undefined,details:r.details??{}});

export class PostgresControlPlaneRepository implements ControlPlaneRepository {
  constructor(private readonly db:SqlExecutor){}
  async listCapabilities(environment:string){return (await this.db.query<any>('SELECT * FROM platform_capability WHERE environment=$1 ORDER BY name',[environment])).rows.map(c)}
  async getCapability(environment:string,id:string){const r=(await this.db.query<any>('SELECT * FROM platform_capability WHERE environment=$1 AND capability_id=$2',[environment,id])).rows[0];return r?c(r):undefined}
  async listDependencies(environment:string){return (await this.db.query<any>('SELECT d.* FROM capability_dependency d JOIN platform_capability c ON c.capability_id=d.capability_id WHERE c.environment=$1',[environment])).rows.map(d)}
  async listConfigVersions(environment:string){return (await this.db.query<any>('SELECT * FROM configuration_version WHERE environment=$1 ORDER BY version DESC',[environment])).rows.map(cfg)}
  async getChange(id:string){const r=(await this.db.query<any>('SELECT * FROM platform_change WHERE change_id=$1',[id])).rows[0];return r?ch(r):undefined}
  async saveChange(x:PlatformChange){await this.db.query(`INSERT INTO platform_change(change_id,environment,requested_by,requested_at,capability,old_state,desired_state,risk_level,status,impact,approved_by,started_at,completed_at,rollback_change_id)
VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
ON CONFLICT(change_id) DO UPDATE SET desired_state=EXCLUDED.desired_state,status=EXCLUDED.status,impact=EXCLUDED.impact,approved_by=EXCLUDED.approved_by,started_at=EXCLUDED.started_at,completed_at=EXCLUDED.completed_at,rollback_change_id=EXCLUDED.rollback_change_id`,[x.changeId,x.environment,x.requestedBy,x.requestedAt,x.capability,x.oldState,x.desiredState,x.riskLevel,x.status,x.impact??null,x.approvedBy??null,x.startedAt??null,x.completedAt??null,x.rollbackChangeId??null])}
  async saveConfigVersion(x:ConfigurationVersion){await this.db.query('INSERT INTO configuration_version(version,environment,configuration,created_by,created_at,active) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(version) DO UPDATE SET configuration=EXCLUDED.configuration,active=EXCLUDED.active',[x.version,x.environment,x.configuration,x.createdBy,x.createdAt,x.active])}
  async activateConfigVersion(environment:string,version:number){await this.db.query('BEGIN');try{await this.db.query('UPDATE configuration_version SET active=false WHERE environment=$1',[environment]);const r=await this.db.query('UPDATE configuration_version SET active=true WHERE environment=$1 AND version=$2 RETURNING version',[environment,version]);if(r.rows.length===0)throw Object.assign(new Error('Configuration version not found'),{statusCode:404,code:'CONFIG_VERSION_NOT_FOUND'});await this.db.query('COMMIT')}catch(e){await this.db.query('ROLLBACK');throw e}}
  async providerHealth(environment:string){return (await this.db.query<any>('SELECT * FROM provider_health WHERE environment=$1 ORDER BY provider',[environment])).rows.map(ph)}
  async appendAudit(x:AuditEvent){await this.db.query('INSERT INTO audit_event(actor,action,resource,old_value,new_value,environment,correlation_id,timestamp,result) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[x.actor,x.action,x.resource,x.oldValue??null,x.newValue??null,x.environment,x.correlationId,x.timestamp,x.result])}
}
