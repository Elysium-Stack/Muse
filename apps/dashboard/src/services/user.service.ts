import { Injectable, effect, signal } from '@angular/core';
import { AuthService } from '@muse/sdk';
import { take } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class UserService {
	public accessToken$ = signal<string | null>(null);
	public refreshToken$ = signal<string | null>(null);
	public user$ = signal<any>(null);
	public loadingUser$ = signal<boolean>(false);

	constructor(
		private _tokenStorage: TokenStorageService,
		private _auth: AuthService,
	) {
		const storageAccessToken = this._tokenStorage.getAccessToken();
		const storageRefreshToken = this._tokenStorage.getRefreshToken();

		if (storageAccessToken) {
			this.accessToken$.set(storageAccessToken);
		}

		if (storageRefreshToken) {
			this.refreshToken$.set(storageRefreshToken);
		}

		console.log(storageAccessToken, storageRefreshToken);
		if (storageAccessToken || storageRefreshToken) {
			setTimeout(() => this._loadUser(), 100);
		}

		effect(() => {
			// this._tokenStorage.saveAccessToken(this.accessToken$());
			// this._tokenStorage.saveRefreshToken(this.refreshToken$());
		});
	}

	signin(code: string) {
		this.loadingUser$.set(true);
		this._auth
			.authControllerCallback({ code })
			.pipe(take(1))
			.subscribe({
				next: ({ accessToken, refreshToken }) => {
					this.saveAccessToken(accessToken);
					this.saveRefreshToken(refreshToken);
					this._loadUser();
				},
				error: () => this.signout(),
			});
	}

	refreshToken(token?: string) {
		const refreshToken = token ?? this.refreshToken$();
		return this._auth.authControllerRefresh({ refreshToken }).pipe(take(1));
	}

	saveAccessToken(accessToken: string) {
		this.accessToken$.set(accessToken);
		this._tokenStorage.saveAccessToken(accessToken);
	}

	saveRefreshToken(refreshToken: string) {
		this.refreshToken$.set(refreshToken);
		this._tokenStorage.saveRefreshToken(refreshToken);
	}

	signout() {
		this.user$.set(null);
		this.accessToken$.set(null);
		this.refreshToken$.set(null);
		this._tokenStorage.signout();
	}

	private _loadUser() {
		this.loadingUser$.set(true);
		this._auth
			.authControllerWhoami()
			.pipe(take(1))
			.subscribe({
				next: ({ discord }) => this.user$.set(discord),
				complete: () => this.loadingUser$.set(false),
			});
	}
}
