import { Injectable } from '@angular/core';

const TOKEN_KEY = 'muse-access-token';
const REFRESHTOKEN_KEY = 'muse-refresh-token';
// const USER_KEY = 'muse-user';

@Injectable({
	providedIn: 'root',
})
export class TokenStorageService {
	signout(): void {
		window.sessionStorage.clear();
	}

	public saveAccessToken(token: string | null): void {
		window.sessionStorage.removeItem(TOKEN_KEY);
		if (token) {
			window.sessionStorage.setItem(TOKEN_KEY, token);
		}
	}

	public getAccessToken(): string | null {
		return window.sessionStorage.getItem(TOKEN_KEY);
	}

	public saveRefreshToken(token: string | null): void {
		window.sessionStorage.removeItem(REFRESHTOKEN_KEY);
		if (token) {
			window.sessionStorage.setItem(REFRESHTOKEN_KEY, token);
		}
	}

	public getRefreshToken(): string | null {
		return window.sessionStorage.getItem(REFRESHTOKEN_KEY);
	}
}
