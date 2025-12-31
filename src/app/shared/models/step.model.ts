export interface SortStep{
    array: number[];
    compare?: number[];
    swap?: number[];
    sorted?: number[];
    type: 'compare' | 'swap';
}