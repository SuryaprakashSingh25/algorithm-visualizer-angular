export interface SortStep{
    array: number[];
    compare?: number[];
    swap?: number[];
    overwrite?: number[];
    sorted?: number[];
    type: 'compare' | 'swap' | 'overwrite';
    mergeInfo?: {
        level: number;
        left: number;
        right: number;
        mid: number;
        leftPointer?: number;
        rightPointer?: number;
        target?: number;
        midValue?: number;
        operation: 'dividing' | 'merging_compare' | 'merging_write' | 'merged';
    };
}