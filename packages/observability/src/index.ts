const SENSITIVE=/password|authorization|cookie|token|refresh.?token|api.?key|secret|payment|document.?content/i;
export function redact(value:unknown):unknown{if(Array.isArray(value))return value.map(redact);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([k,v])=>[k,SENSITIVE.test(k)?'[REDACTED]':redact(v)]));return value}
export interface LogEvent{timestamp:string;level:string;service:string;environment:string;tenantId?:string;correlationId:string;traceId?:string;event:string;durationMs?:number;deploymentVersion?:string;configurationVersion?:string;[key:string]:unknown}
export function structuredLog(input:Omit<LogEvent,'timestamp'>):LogEvent{return redact({timestamp:new Date().toISOString(),...input}) as LogEvent}
export const requiredSignals=['latency_p50','latency_p95','latency_p99','traffic','errors','saturation','db_connections','slow_queries','queue_depth','queue_age','consumer_lag','dlq_growth','cache_hit_ratio','worker_success','worker_failure','webhook_errors','ai_latency','ai_tokens','ai_usage','tenant_usage','deployment_version','configuration_version'] as const;
export type HealthState='REQUIRED'|'OPTIONAL'|'DEGRADED'|'HEALTHY'|'UNAVAILABLE';
export interface SloDefinition{name:string;indicator:string;target:number;window:string;owner:string;severity:'critical'|'high'|'medium'|'low';dashboard:string;escalation:string;runbook:string}
export interface AlertEvent{signal:string;value:number;threshold:number;severity:string;owner:string;dashboard:string;escalation:string;runbook:string;correlationId?:string}
export interface TelemetryExporter{exportLog(event:LogEvent):Promise<void>;exportMetric(name:string,value:number,attributes?:Record<string,string|number|boolean>):Promise<void>;exportSpan(name:string,attributes?:Record<string,string|number|boolean>):Promise<void>}
export class TelemetryFanout{
 constructor(private readonly exporters:TelemetryExporter[]){}
 async log(event:Omit<LogEvent,'timestamp'>){const e=structuredLog(event);await Promise.allSettled(this.exporters.map(x=>x.exportLog(e)));return e}
 async metric(name:string,value:number,attributes?:Record<string,string|number|boolean>){await Promise.allSettled(this.exporters.map(x=>x.exportMetric(name,value,attributes)))}
 async span(name:string,attributes?:Record<string,string|number|boolean>){await Promise.allSettled(this.exporters.map(x=>x.exportSpan(name,attributes)))}
}
