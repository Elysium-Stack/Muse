import { EventEmitter, Injectable, inject, signal } from '@angular/core';
import { AuthService } from '@sdk';
import { take, tap } from 'rxjs';

import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class UserService {
	private _tokenStorage = inject(TokenStorageService);
	private _auth = inject(AuthService);

	public accessToken$ = signal<string | null>(null);
	public refreshToken$ = signal<string | null>(null);
	public user$ = signal<any>(null);
	public loadingUser$ = signal<boolean>(false);

	public signout$ = new EventEmitter<void>();

	constructor() {
		const storageAccessToken = this._tokenStorage.getAccessToken();
		const storageRefreshToken = this._tokenStorage.getRefreshToken();

		if (storageAccessToken) {
			this.accessToken$.set(storageAccessToken);
		}

		if (storageRefreshToken) {
			this.refreshToken$.set(storageRefreshToken);
		}

		if (storageAccessToken || storageRefreshToken) {
			setTimeout(() => this._loadUser(), 100);
		}
	}

	signin$(code: string) {
		this.loadingUser$.set(true);
		return this._auth.authControllerCallback({ code }).pipe(
			take(1),
			tap({
				next: ({ accessToken, refreshToken }) => {
					this.saveAccessToken(accessToken);
					this.saveRefreshToken(refreshToken);
					this._loadUser();
				},
				error: () => this.signout(),
			}),
		);
	}

	refreshToken() {
		return this._auth.authControllerRefresh().pipe(
			take(1),
			tap({
				next: ({ accessToken, refreshToken }) => {
					this.saveAccessToken(accessToken);
					this.saveRefreshToken(refreshToken);
				},
				error: () => this.signout(),
			}),
		);
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
		this.signout$.next();
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
