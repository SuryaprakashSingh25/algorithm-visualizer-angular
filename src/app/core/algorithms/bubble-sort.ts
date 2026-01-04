import { SortStep } from "../../shared/models/step.model";

export function bubbleSort(arr: number[]): SortStep[]{
    const steps: SortStep[]=[];
    const array=[...arr];
    const sorted: number[] = [];

    for(let i=0;i<array.length;i++){
        for(let j=0;j<array.length-i-1;j++){
            steps.push({
                array: [...array],
                compare: [j,j+1],
                type: 'compare',
                sorted: [...sorted]
            });

            if(array[j]>array[j+1]){
                [array[j],array[j+1]]=[array[j+1],array[j]];

                steps.push({
                    array: [...array],
                    swap: [j,j+1],
                    type: 'swap',
                    sorted: [...sorted]
                });
            }
        }
        sorted.push(array.length - i - 1);
    }
    return steps;
}