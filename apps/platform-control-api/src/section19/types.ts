export type RiskLevel='GREEN'|'BLUE'|'AMBER'|'RED'|'LOCKED';
export type ChangeStatus='DRAFT'|'VALIDATING'|'IMPACT_ANALYSIS'|'WAITING_APPROVAL'|'APPROVED'|'PROVISIONING'|'DEPLOYING'|'VERIFYING'|'STABILIZING'|'COMPLETED'|'FAILED'|'ROLLING_BACK'|'ROLLED_BACK';
export interface PlatformCapability {capabilityId:string;name:string;type:string;criticality:'CORE'|'REQUIRED'|'OPTIONAL'|'OPERATIONAL';enabled:boolean;desiredState:Record<string,unknown>;actualState:Record<string,unknown>;provider?:string;fallbackProvider?:string;health:string;environment:string;version:number}
export interface CapabilityDependency {capabilityId:string;dependsOn:string;dependencyType:string;required:boolean;fallbackCapability?:string}
export interface PlatformChange {changeId:string;environment:string;requestedBy:string;requestedAt:string;capability:string;oldState:Record<string,unknown>;desiredState:Record<string,unknown>;riskLevel:RiskLevel;status:ChangeStatus;impact?:Record<string,unknown>;approvedBy?:string;startedAt?:string;completedAt?:string;rollbackChangeId?:string}
export interface ConfigurationVersion {version:number;environment:string;configuration:Record<string,unknown>;createdBy:string;createdAt:string;active:boolean}
export interface DeploymentExecution {executionId:string;changeId:string;pipeline:string;status:string;startedAt:string;completedAt?:string;healthResult?:Record<string,unknown>}
export interface ProviderHealth {provider:string;environment:string;state:string;lastCheck:string;latency?:number;details:Record<string,unknown>}
export interface AuditEvent {actor:string;action:string;resource:string;oldValue?:unknown;newValue?:unknown;environment:string;correlationId:string;timestamp:string;result:string}
