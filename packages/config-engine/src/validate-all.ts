import type {DesiredState} from './types.js';
import {validateDesiredState} from './validate.js';
import {assertLockedState,type Environment} from '../../policy-engine/src/index.js';
export interface FullValidationResult{valid:boolean;schemaIssues:ReturnType<typeof validateDesiredState>;dependencyIssues:Array<{code:string;message:string}>}
export function validatePlatformState(state:DesiredState,environment:Environment):FullValidationResult{
 const schemaIssues=validateDesiredState(state);const dependencyIssues:Array<{code:string;message:string}>=[];
 try{assertLockedState(state,environment)}catch(error){schemaIssues.push({path:'platform',code:'LOCKED_POLICY',message:error instanceof Error?error.message:'Locked policy violation'})}
 return{valid:schemaIssues.length===0&&dependencyIssues.length===0,schemaIssues,dependencyIssues};
}
export function assertPlatformState(state:DesiredState,environment:Environment):void{const r=validatePlatformState(state,environment);if(!r.valid)throw new Error(`Platform desired state rejected: ${JSON.stringify(r)}`)}
