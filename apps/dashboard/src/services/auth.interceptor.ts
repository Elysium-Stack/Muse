import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from '@sdk';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	private isRefreshing = false;
	private accessTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
		null,
	);

	constructor(private _auth: AuthService, private _user: UserService) {}

	intercept(
		req: HttpRequest<any>,
		next: HttpHandler,
	): Observable<HttpEvent<Object>> {
		let authReq = req;
		const accessToken = this._user.accessToken$();
		const refreshToken = this._user.refreshToken$();

		if (accessToken != null && !req.url.endsWith('auth/refresh')) {
			authReq = this.addTokenHeader(req, accessToken);
		}

		if (refreshToken != null && req.url.endsWith('auth/refresh')) {
			authReq = this.addTokenHeader(req, refreshToken);
		}

		return next.handle(authReq).pipe(
			catchError((error) => {
				if (
					error instanceof HttpErrorResponse &&
					!authReq.url.endsWith('auth') &&
					error.status === 401
				) {
					return this.handle401Error(authReq, next);
				}

				return throwError(error);
			}),
		);
	}

	private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
		if (!this.isRefreshing) {
			this.isRefreshing = true;
			this.accessTokenSubject.next(null);

			const token = this._user.refreshToken$();

			if (token) {
				return this._auth.authControllerRefresh().pipe(
					switchMap((token: any) => {
						this.isRefreshing = false;

						this._user.saveAccessToken(token.accessToken);
						this._user.saveRefreshToken(token.refreshToken);

						return next.handle(
							this.addTokenHeader(request, token.accessToken),
						);
					}),
					catchError((err) => {
						this.isRefreshing = false;

						this._user.signout();
						return throwError(err);
					}),
				);
			}
		}

		return this.accessTokenSubject.pipe(
			filter((token) => token !== null),
			take(1),
			switchMap((token) =>
				next.handle(this.addTokenHeader(request, token)),
			),
		);
	}

	private addTokenHeader(request: HttpRequest<any>, token: string) {
		return request.clone({
			headers: request.headers.set('Authorization', `Bearer ${token}`),
		});
	}
}
