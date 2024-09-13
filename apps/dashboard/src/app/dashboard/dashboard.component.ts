import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// eslint-disable-next-line @angular-eslint/use-component-selector
@Component({
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: './dashboard.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
