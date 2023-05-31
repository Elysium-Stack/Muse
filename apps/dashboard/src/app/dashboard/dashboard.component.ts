import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: './dashboard.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
