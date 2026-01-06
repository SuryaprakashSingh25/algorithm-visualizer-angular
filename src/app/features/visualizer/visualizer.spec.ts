import { VisualizerComponent } from './visualizer';
import { SortStep } from '../../shared/models/step.model';

describe('VisualizerComponent', () => {
  let component: VisualizerComponent;

  beforeEach(() => {
    const mockChangeDetectorRef = {
      detectChanges: jasmine.createSpy('detectChanges')
    };
    component = new VisualizerComponent(mockChangeDetectorRef as any);
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
  });

  it('generateArray creates 20 random numbers and resets state', () => {
    component.generateArray();
    expect(component.originalArray.length).toBe(20);
    expect(component.array.length).toBe(20);
    expect(component.array).toEqual(component.originalArray);
    expect(component.currentStep).toBe(-1);
    expect(component.steps.length).toBe(0);
    expect(component.activeIndices.length).toBe(0);
    expect(component.sortedIndices.length).toBe(0);
  });

  it('generateArray produces numbers between 1 and 100', () => {
    component.generateArray();
    component.originalArray.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(100);
    });
  });

  it('startSort accepts algorithm and populates steps', () => {
    component.originalArray = [3, 1, 2];
    const mockSteps: SortStep[] = [
      { array: [1, 2, 3], type: 'swap' as any, swap: [0, 1] }
    ];
    const mockAlgorithm = (arr: number[]) => mockSteps;

    component.startSort(mockAlgorithm);
    expect(component.steps).toEqual(mockSteps);
    expect(component.currentStep).toBe(-1);
  });

  it('nextStep advances to next step and updates state', () => {
    component.steps = [
      { array: [5, 4], type: 'swap' as any, swap: [0, 1] },
      { array: [4, 5], type: 'swap' as any, swap: [0, 1] }
    ];
    component.currentStep = -1;

    component.nextStep();
    expect(component.currentStep).toBe(0);
    expect(component.array).toEqual([5, 4]);
    expect(component.activeIndices).toEqual([0, 1]);
    expect(component.currentStepType).toBe('swap');
  });

  it('nextStep does nothing when at end of steps', () => {
    component.steps = [{ array: [1, 2], type: 'swap' as any, swap: [0, 1] }];
    component.currentStep = 0;
    
    component.nextStep();
    expect(component.currentStep).toBe(0);
  });

  it('pause stops playing', () => {
    component.isPlaying = true;
    component.pause();
    expect(component.isPlaying).toBe(false);
  });

  it('reset clears state and stops playback', () => {
    component.originalArray = [1, 2, 3];
    component.array = [3, 2, 1];
    component.currentStep = 2;
    component.steps = [{ array: [1], type: 'compare' as any }];
    component.activeIndices = [0, 1];
    component.isPlaying = true;

    component.reset();
    expect(component.array).toEqual(component.originalArray);
    expect(component.currentStep).toBe(-1);
    expect(component.activeIndices.length).toBe(0);
    expect(component.isPlaying).toBe(false);
  });

});
