import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	standalone: true,
	selector: 'm-particles',
	imports: [CommonModule],
	templateUrl: './particles.component.html',
	styleUrls: ['./particles.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticlesComponent {}
