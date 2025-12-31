import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VisualizerComponent } from './features/visualizer/visualizer';

@Component({
  selector: 'app-root',
  imports: [VisualizerComponent],
  standalone: true,
  templateUrl: './app.html'
})
export class App {}

