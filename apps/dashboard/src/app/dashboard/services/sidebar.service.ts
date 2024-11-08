import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DashboardSidebarService {
	public show$ = signal<boolean>(false);

	show() {
		if (!this.show$()) {
			this.show$.set(true);
		}
	}

	hide() {
		if (this.show$()) {
			this.show$.set(false);
		}
	}
}
