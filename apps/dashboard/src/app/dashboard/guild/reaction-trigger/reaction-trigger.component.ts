import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DashboardPageTitleComponent } from '../../components/page-title/page-title.component';

// eslint-disable-next-line @angular-eslint/use-component-selector
@Component({
	standalone: true,
	imports: [CommonModule, DashboardPageTitleComponent],
	templateUrl: './reaction-trigger.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardModulesReactionTriggerComponent {}
