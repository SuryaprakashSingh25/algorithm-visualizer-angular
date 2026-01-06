import { SortStep } from "../../shared/models/step.model";

export function mergeSort(arr: number[]): SortStep[]{
    const steps: SortStep[]=[];
    const main=[...arr];
    let level = 0;

    function merge(left:number, mid:number, right:number, currentLevel: number){
        const temp=new Array(right-left+1);
        let i=left;
        let j=mid+1;
        let k=0;

        steps.push({
            array: [...main],
            compare: [],
            type: 'compare',
            mergeInfo: {
                level: currentLevel,
                left,
                right,
                mid,
                operation: 'merging_compare',
            }
        });

        while(i<=mid && j<=right){
            steps.push({
                array: [...main],
                compare: [i,j],
                type: 'compare',
                mergeInfo: {
                    level: currentLevel,
                    left,
                    right,
                    mid,
                    leftPointer: i,
                    rightPointer: j,
                    operation: 'merging_compare',
                }
            });

            if(main[i]<=main[j]){
                temp[k]=main[i];
                i++;
            }
            else{
                temp[k]=main[j];
                j++;
            }
            k++;
        }

        while(i<=mid){
            temp[k]=main[i];
            i++;
            k++;
        }

        while(j<=right){
            temp[k]=main[j];
            j++;
            k++;
        }

        for(let x=0;x<temp.length;x++){
            main[left+x]=temp[x];
            steps.push({
                array: [...main],
                overwrite: [left+x],
                type: 'overwrite',
                mergeInfo: {
                    level: currentLevel,
                    left,
                    right,
                    mid,
                    operation: 'merging_write',
                }
            });
        }

        steps.push({
            array: [...main],
            sorted: Array.from({length: right-left+1}, (_, i) => left+i),
            type: 'overwrite',
            mergeInfo: {
                level: currentLevel,
                left,
                right,
                mid,
                operation: 'merged',
            }
        });
    }

    function divide(left: number, right: number, currentLevel: number){
        if(left>=right){
            return;
        }
        const mid=Math.floor((left+right)/2);
        
        steps.push({
            array: [...main],
            compare: [],
            type: 'compare',
            mergeInfo: {
                level: currentLevel,
                left,
                right,
                mid,
                operation: 'dividing',
            }
        });

        divide(left,mid,currentLevel+1);
        divide(mid+1,right,currentLevel+1);
        merge(left,mid,right,currentLevel);
    }

    divide(0,main.length-1,1);
    return steps;
}