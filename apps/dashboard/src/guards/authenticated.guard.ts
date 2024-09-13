import { Injectable, inject } from '@angular/core';
import { map, take } from 'rxjs/operators';

import { environment } from '../environment/environment';
import { UserService } from '../services/user.service';
import { tokenExpired } from '../util/jwt-token';

@Injectable()
export class AuthenticatedGuard {
	private _user = inject(UserService);

	public canActivate() {
		const token = this._user.accessToken$();
		if (!token) {
			return this._refreshToken();
		}

		const tokenExpiry = tokenExpired(token);
		if (tokenExpiry.expired) {
			return this._refreshToken();
		}

		return true;
	}

	private _decline() {
		window.location.href = `${environment.api.baseUrl}/api/auth`;
	}

	private _refreshToken() {
		const refreshToken = this._user.refreshToken$();
		if (!refreshToken) {
			return this._decline();
		}

		return this._user.refreshToken().pipe(
			take(1),
			map(({ accessToken }) => !!accessToken || this._decline())
		);
	}
}
