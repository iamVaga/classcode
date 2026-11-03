export type BandwidthMode='auto'|'standard'|'saver';
export type ConnectionHint={saveData?:boolean;effectiveType?:string;downlink?:number;rtt?:number};
export function shouldConserve(mode:BandwidthMode,hint:ConnectionHint={},online=true){
 if(!online||mode==='saver')return true;
 if(mode==='standard')return false;
 return !!hint.saveData||['slow-2g','2g'].includes(hint.effectiveType||'')||(typeof hint.downlink==='number'&&hint.downlink<=1.5)||(typeof hint.rtt==='number'&&hint.rtt>=500);
}
