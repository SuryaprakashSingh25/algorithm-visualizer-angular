import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { SortStep } from '../../shared/models/step.model';
import { bubbleSort } from '../../core/algorithms/bubble-sort';
import { FormsModule } from '@angular/forms';

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
  currentStepType: 'compare' | 'swap' | null = null;
  activeIndices: number[]=[];
  originalArray: number[] = [];
  isPlaying=false;
  intervalId: any;
  speed=1000;
  bubbleSortAlgo = bubbleSort;


  constructor(private cd: ChangeDetectorRef) {}

  generateArray(){
    this.originalArray = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 100) + 1
    );
    this.array = [...this.originalArray];
    this.steps=[];
    this.currentStep=-1;
    this.activeIndices=[];
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

      this.activeIndices = step.compare ?? step.swap ?? [];
    }
  }


  async play() {
    if (this.isPlaying) return;
    
    // If no steps generated yet, generate them from the original array.
    if (!this.steps.length) {
      if (!this.originalArray || !this.originalArray.length) {
        this.generateArray();
      }
      this.startSort(this.bubbleSortAlgo);
    }

    // If we've already reached the end, restart from beginning.
    if (this.currentStep >= this.steps.length - 1) {
      this.currentStep = -1;
      this.array = [...this.originalArray];
      this.activeIndices = [];
    }

    this.isPlaying = true;

    while (this.isPlaying && this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      const step = this.steps[this.currentStep];
      this.currentStepType = step.type;
      // Phase 1: highlight comparison or swap indices
      this.activeIndices = step.compare ?? step.swap ?? [];
      this.cd.detectChanges();
      await this.waitForPaint();
      await this.delay(this.speed / 2);

      // Phase 2: apply array change (if any) so bars move
      this.array = [...step.array];
      this.cd.detectChanges();
      await this.waitForPaint();
      await this.delay(this.speed / 2);
    }

    this.activeIndices = [];
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
    this.cd.detectChanges();
  }

}
