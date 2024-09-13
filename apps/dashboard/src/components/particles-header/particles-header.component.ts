import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ParticlesComponent } from '../particles/particles.component';

@Component({
	standalone: true,
	selector: 'm-particles-header',
	imports: [ParticlesComponent],
	templateUrl: './particles-header.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'fixed -z-10 w-full min-h-[50%]',
	},
})
export class ParticlesHeaderComponent {}
