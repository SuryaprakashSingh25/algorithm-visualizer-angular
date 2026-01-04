import { SortStep } from "../../shared/models/step.model";

export function binarySearch(arr: number[], target?: number): SortStep[]{
    if (target === undefined) {
        target = Math.floor(Math.random() * 100) + 1;
    }
    const steps: SortStep[]=[];
    const array=[...arr].sort((a,b)=>a-b);
    const found: number[] = [];

    let left=0;
    let right=array.length-1;
    let level=1;

    while(left<=right){
        const mid=Math.floor((left+right)/2);
        const midValue = array[mid];

        steps.push({
            array: [...array],
            compare: [mid],
            type: 'compare',
            mergeInfo: {
                level,
                left,
                right,
                mid,
                target,
                midValue,
                operation: 'merging_compare',
            },
            sorted: [...found]
        });

        if(midValue===target){
            found.push(mid);
            steps.push({
                array: [...array],
                sorted: [...found],
                type: 'overwrite',
                mergeInfo: {
                    level,
                    left,
                    right,
                    mid,
                    target,
                    midValue,
                    operation: 'merged',
                }
            });
            break;
        }

        if(midValue<target){
            left=mid+1;
        }
        else{
            right=mid-1;
        }
        level++;
    }
    return steps;
}