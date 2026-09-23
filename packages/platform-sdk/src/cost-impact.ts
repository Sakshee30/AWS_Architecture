export interface CostImpact{capability:'redis'|'msk'|'opensearch';currentMonthlyUsd?:number;estimatedMonthlyUsd?:number;estimatedSavingsUsd?:number;impact:string;advisory:true}
export function costImpact(input:Omit<CostImpact,'advisory'>):CostImpact{return{...input,advisory:true}}
export function assertCostCannotAuthorizeChange(_:CostImpact):never{throw new Error('Cost data is advisory and cannot bypass dependency, policy, health or approval gates')}
