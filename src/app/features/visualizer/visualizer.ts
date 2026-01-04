import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { SortStep } from '../../shared/models/step.model';
import { bubbleSort } from '../../core/algorithms/bubble-sort';
import { FormsModule } from '@angular/forms';
import { mergeSort } from '../../core/algorithms/merge-sort';
import { binarySearch } from '../../core/algorithms/binary-search';

interface Algorithm {
  id: string;
  name: string;
  func: (arr: number[], target?: number) => SortStep[];
}

@Component({
  selector: 'app-visualizer',
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizer.html',
  styleUrl: './visualizer.scss',
})
export class VisualizerComponent {
  array: number[]=[];
  steps: SortStep[]=[];
  currentStep=0;
  currentStepType: 'compare' | 'swap' | 'overwrite' | null = null;
  activeIndices: number[]=[];
  sortedIndices: number[]=[];
  originalArray: number[] = [];
  isPlaying=false;
  intervalId: any;
  speed=1000;
  bubbleSortAlgo = bubbleSort;
  mergeSortAlgo=mergeSort;
  binarySearchAlgo=binarySearch;
  
  mergeInfo: any = null;
  statusMessage = '';
  selectedAlgorithm: string = 'merge-sort';
  searchLeft: number = -1;
  searchRight: number = -1;
  algorithms: Algorithm[] = [
    { id: 'bubble-sort', name: 'Bubble Sort', func: bubbleSort },
    { id: 'merge-sort', name: 'Merge Sort', func: mergeSort },
    { id: 'binary-search', name: 'Binary Search', func: binarySearch }
  ];


  constructor(private cd: ChangeDetectorRef) {}

  generateArray(){
    this.originalArray = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 100) + 1
    );
    this.array = [...this.originalArray];
    this.steps=[];
    this.currentStep=-1;
    this.activeIndices=[];
    this.sortedIndices=[];
    this.mergeInfo=null;
    this.statusMessage='';
  }

  startSort(algorithm: (arr: number[], target?: number) => SortStep[]) {
    const tempArray = [...this.originalArray];
    const target = this.selectedAlgorithm === 'binary-search' ? Math.floor(Math.random() * 100) + 1 : undefined;
    this.steps = algorithm(tempArray, target);
    this.reset();
  }

  getSelectedAlgorithm(): (arr: number[], target?: number) => SortStep[] {
    const algo = this.algorithms.find(a => a.id === this.selectedAlgorithm);
    return algo ? algo.func : mergeSort;
  }

  nextStep() {
    if (!this.steps.length) return;

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      const step = this.steps[this.currentStep];
      this.array = [...step.array];
      this.activeIndices = step.compare ?? step.swap ?? step.overwrite ?? [];
      this.sortedIndices = step.sorted ?? [];
      this.mergeInfo = step.mergeInfo || null;
      this.currentStepType = step.type;
      
      // Track search boundaries for binary search
      if (this.selectedAlgorithm === 'binary-search' && this.mergeInfo) {
        this.searchLeft = this.mergeInfo.left;
        this.searchRight = this.mergeInfo.right;
      } else {
        this.searchLeft = -1;
        this.searchRight = -1;
      }
      
      this.updateStatusMessage();
    }
  }

  updateStatusMessage(){
    if (!this.mergeInfo) {
      this.statusMessage = '';
      return;
    }

    const {level, left, right, operation} = this.mergeInfo;
    
    switch(operation){
      case 'dividing':
        this.statusMessage = `Level ${level}: Dividing array [${left}..${right}]`;
        break;
      case 'merging_compare':
        if (this.selectedAlgorithm === 'binary-search') {
          const target = (this.mergeInfo as any).target;
          const midValue = (this.mergeInfo as any).midValue;
          const mid = this.mergeInfo.mid;
          
          if (midValue < target) {
            this.statusMessage = `Level ${level}: Target=${target} | Mid[${mid}]=${midValue} (too small) | Lower Bound: ${left}, Upper Bound: ${right} → Search RIGHT`;
          } else if (midValue > target) {
            this.statusMessage = `Level ${level}: Target=${target} | Mid[${mid}]=${midValue} (too large) | Lower Bound: ${left}, Upper Bound: ${right} → Search LEFT`;
          } else {
            this.statusMessage = `Level ${level}: Found ${target} at index ${mid}!`;
          }
        } else {
          this.statusMessage = `Level ${level}: Comparing & merging array [${left}..${right}]`;
        }
        break;
      case 'merging_write':
        this.statusMessage = `Level ${level}: Writing merged values for [${left}..${right}]`;
        break;
      case 'merged':
        if (this.selectedAlgorithm === 'binary-search') {
          const target = (this.mergeInfo as any).target;
          this.statusMessage = `✓ Found target ${target} at index ${this.mergeInfo.mid}!`;
        } else {
          this.statusMessage = `Level ${level}: Finished merging [${left}..${right}]`;
        }
        break;
      default:
        this.statusMessage = '';
    }
  }

  async play() {
    if (this.isPlaying) return;
    
    if (!this.steps.length) {
      if (!this.originalArray || !this.originalArray.length) {
        this.generateArray();
      }
      this.startSort(this.getSelectedAlgorithm());
    }

    if (this.currentStep >= this.steps.length - 1) {
      this.currentStep = -1;
      this.array = [...this.originalArray];
      this.activeIndices = [];
      this.sortedIndices = [];
    }

    this.isPlaying = true;

    while (this.isPlaying && this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      const step = this.steps[this.currentStep];
      
      this.activeIndices = step.compare ?? step.swap ?? step.overwrite ?? [];
      this.sortedIndices = step.sorted ?? [];
      this.mergeInfo = step.mergeInfo || null;
      
      // Track search boundaries for binary search
      if (this.selectedAlgorithm === 'binary-search' && this.mergeInfo) {
        this.searchLeft = this.mergeInfo.left;
        this.searchRight = this.mergeInfo.right;
      } else {
        this.searchLeft = -1;
        this.searchRight = -1;
      }
      
      this.updateStatusMessage();

      this.currentStepType = step.type;
      this.cd.detectChanges();
      await this.waitForPaint();
      await this.delay(this.speed / 2);

      this.array = [...step.array];
      this.cd.detectChanges();
      await this.waitForPaint();
      await this.delay(this.speed / 2);
    }

    this.activeIndices = [];
    this.sortedIndices = [];
    const completionMessage = this.selectedAlgorithm === 'binary-search' ? 'Search complete!' : 'Sorting complete!';
    this.statusMessage = completionMessage;
    this.cd.detectChanges();
    this.isPlaying = false;
}

  delay(ms:number){
    return new Promise(resolve => setTimeout(resolve,ms));
  }

  waitForPaint(){
    return new Promise(resolve => requestAnimationFrame(() => resolve(null)));
  }

  pause(){
    this.isPlaying=false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(){
    this.pause();
    this.array=[...this.originalArray];
    this.currentStep=-1;
    this.activeIndices=[];
    this.sortedIndices=[];
    this.mergeInfo=null;
    this.statusMessage='';
    this.searchLeft=-1;
    this.searchRight=-1;
    this.cd.detectChanges();
  }

}
