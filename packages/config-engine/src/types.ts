export type Environment='development'|'testing'|'staging'|'production';
export interface CapabilitySelection{enabled:boolean;provider:string;fallback?:string;required?:boolean}
export interface DesiredState{
  platform:{
    database:CapabilitySelection;
    cache:CapabilitySelection;
    distributed_lock:CapabilitySelection;
    idempotency:CapabilitySelection;
    queue:CapabilitySelection;
    event_bus:CapabilitySelection;
    object_storage:CapabilitySelection;
    vector_store:CapabilitySelection;
    search:CapabilitySelection;
    ai:CapabilitySelection;
    observability:{metrics:boolean;tracing:boolean;logging:boolean};
  };
  features:{rag:boolean;whatsapp?:boolean;analytics?:boolean;workflow?:boolean};
}
