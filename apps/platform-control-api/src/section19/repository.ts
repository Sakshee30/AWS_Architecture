import type {PlatformCapability,CapabilityDependency,PlatformChange,ConfigurationVersion,ProviderHealth,AuditEvent} from './types.js';
export interface ControlPlaneRepository {
 listCapabilities(environment:string):Promise<PlatformCapability[]>;
 getCapability(environment:string,id:string):Promise<PlatformCapability|undefined>;
 listDependencies(environment:string):Promise<CapabilityDependency[]>;
 listConfigVersions(environment:string):Promise<ConfigurationVersion[]>;
 getChange(id:string):Promise<PlatformChange|undefined>;
 saveChange(change:PlatformChange):Promise<void>;
 saveConfigVersion(version:ConfigurationVersion):Promise<void>;
 activateConfigVersion(environment:string,version:number):Promise<void>;
 providerHealth(environment:string):Promise<ProviderHealth[]>;
 appendAudit(event:AuditEvent):Promise<void>;
}
