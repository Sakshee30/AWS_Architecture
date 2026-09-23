export type CostTrackedService='rds'|'nat_gateway'|'msk'|'opensearch'|'eks'|'gpu'|'s3'|'data_transfer'|'logs'|'ai_inference';
export interface ServiceCost{service:CostTrackedService;currentMonthlyUsd?:number;forecastMonthlyUsd?:number;unit?:string}
export interface CostImpact{capability:'redis'|'msk'|'opensearch';currentMonthlyUsd?:number;estimatedMonthlyUsd?:number;estimatedSavingsUsd?:number;impact:string;advisory:true}
export function costImpact(input:Omit<CostImpact,'advisory'>):CostImpact{return{...input,advisory:true}}
export function assertCostCannotAuthorizeChange(_:CostImpact):never{throw new Error('Cost data is advisory and cannot bypass dependency, policy, health or approval gates')}
export function validateFinOpsTags(tags:Record<string,string>):string[]{
 const required=['Application','Environment','Service','Owner','CostCenter'];
 return required.filter(k=>!tags[k]||!tags[k].trim());
}
