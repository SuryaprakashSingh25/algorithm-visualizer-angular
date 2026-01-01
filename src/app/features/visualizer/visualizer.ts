import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { SortStep } from '../../shared/models/step.model';
import { bubbleSort } from '../../core/algorithms/bubble-sort';
import { FormsModule } from '@angular/forms';
import { mergeSort } from '../../core/algorithms/merge-sort';

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
  
  mergeInfo: any = null;
  statusMessage = '';


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

  startSort(algorithm: (arr: number[]) => SortStep[]) {
    const tempArray = [...this.originalArray];
    this.steps = algorithm(tempArray);
    this.reset();
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
      this.updateStatusMessage();
    }
  }

  updateStatusMessage(){
    if (!this.mergeInfo) {
      this.statusMessage = '';
      return;
    }

    const {level, left, right, operation} = this.mergeInfo;
    const range = `[${left}..${right}]`;
    
    switch(operation){
      case 'dividing':
        this.statusMessage = `Level ${level}: Dividing array ${range}`;
        break;
      case 'merging_compare':
        this.statusMessage = `Level ${level}: Comparing & merging array ${range}`;
        break;
      case 'merging_write':
        this.statusMessage = `Level ${level}: Writing merged values for ${range}`;
        break;
      case 'merged':
        this.statusMessage = `Level ${level}: Finished merging ${range}`;
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
      this.startSort(this.mergeSortAlgo);
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
    this.statusMessage = 'Sorting complete!';
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
    this.cd.detectChanges();
  }

}
