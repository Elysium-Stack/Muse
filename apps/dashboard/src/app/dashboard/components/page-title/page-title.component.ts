import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
	standalone: true,
	selector: 'm-dashboard-page-title',
	imports: [CommonModule],
	templateUrl: './page-title.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageTitleComponent {
	@Input() margin = true;
}
