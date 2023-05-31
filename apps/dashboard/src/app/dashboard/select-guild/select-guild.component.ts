import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationComponent } from '../../../components/navigation/navigation.component';
import { ParticlesComponent } from '../../../components/particles/particles.component';

import { RouterModule } from '@angular/router';
import { GuildIconComponent } from 'apps/dashboard/src/components/guild-icon/guild-icon.component';
import { environment } from '../../../environment/environment';
import { DashboardGuildService } from '../services/guild.service';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		ParticlesComponent,
		NavigationComponent,
		GuildIconComponent,
		RouterModule,
	],
	templateUrl: './select-guild.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSelectGuildComponent {
	private _guild = inject(DashboardGuildService);
	public inviteUrl = environment.bot.inviteUrl;

	public loadingGuilds$ = this._guild.loadingGuilds$;
	public availableGuilds$ = this._guild.availableGuilds$;
	public unavailableGuilds$ = this._guild.unavailableGuilds$;
}
