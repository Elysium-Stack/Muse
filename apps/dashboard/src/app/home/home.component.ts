import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NavigationComponent } from '../../components/navigation/navigation.component';
import { ParticlesComponent } from '../../components/particles/particles.component';
import { environment } from '../../environment/environment';

// eslint-disable-next-line @angular-eslint/use-component-selector
@Component({
	standalone: true,
	imports: [CommonModule, ParticlesComponent, NavigationComponent],
	templateUrl: './home.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
	public inviteUrl = environment.bot.inviteUrl;
}
