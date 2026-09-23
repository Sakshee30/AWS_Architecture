import type {ControlPlaneRepository} from './repository.js';
import type {PlatformCapability,CapabilityDependency,PlatformChange,ConfigurationVersion,ProviderHealth,AuditEvent} from './types.js';

export class InMemoryControlPlaneRepository implements ControlPlaneRepository {
  private capabilities:PlatformCapability[]=[];
  private dependencies:CapabilityDependency[]=[];
  private changes=new Map<string,PlatformChange>();
  private configs:ConfigurationVersion[]=[];
  private health:ProviderHealth[]=[];
  private audit:AuditEvent[]=[];
  listCapabilities(environment:string){return Promise.resolve(this.capabilities.filter(x=>x.environment===environment).map(x=>structuredClone(x)))}
  getCapability(environment:string,id:string){const x=this.capabilities.find(x=>x.environment===environment&&x.capabilityId===id);return Promise.resolve(x?structuredClone(x):undefined)}
  listDependencies(_environment:string){return Promise.resolve(this.dependencies.map(x=>structuredClone(x)))}
  listConfigVersions(environment:string){return Promise.resolve(this.configs.filter(x=>x.environment===environment).map(x=>structuredClone(x)))}
  getChange(id:string){const x=this.changes.get(id);return Promise.resolve(x?structuredClone(x):undefined)}
  saveChange(change:PlatformChange){this.changes.set(change.changeId,structuredClone(change));return Promise.resolve()}
  saveConfigVersion(version:ConfigurationVersion){this.configs=this.configs.filter(x=>!(x.environment===version.environment&&x.version===version.version));this.configs.push(structuredClone(version));return Promise.resolve()}
  async activateConfigVersion(environment:string,version:number){let found=false;this.configs=this.configs.map(x=>{if(x.environment!==environment)return x;const active=x.version===version;if(active)found=true;return{...x,active}});if(!found)throw Object.assign(new Error('Configuration version not found'),{statusCode:404,code:'CONFIG_VERSION_NOT_FOUND'});}
  providerHealth(environment:string){return Promise.resolve(this.health.filter(x=>x.environment===environment).map(x=>structuredClone(x)))}
  appendAudit(event:AuditEvent){this.audit.push(structuredClone(event));return Promise.resolve()}
  seed(input:{capabilities?:PlatformCapability[];dependencies?:CapabilityDependency[];configs?:ConfigurationVersion[];health?:ProviderHealth[]}){if(input.capabilities)this.capabilities=input.capabilities.map(x=>structuredClone(x));if(input.dependencies)this.dependencies=input.dependencies.map(x=>structuredClone(x));if(input.configs)this.configs=input.configs.map(x=>structuredClone(x));if(input.health)this.health=input.health.map(x=>structuredClone(x));}
  auditEvents(){return this.audit.map(x=>structuredClone(x))}
}
