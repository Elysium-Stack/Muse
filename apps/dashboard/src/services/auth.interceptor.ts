import {
    HttpErrorResponse,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import { UserService } from './user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	private _user = inject(UserService);

	private isRefreshing = false;
	private accessTokenSubject$ = new BehaviorSubject<string | null>(
		null
	);

	intercept(
		req: HttpRequest<unknown>,
		next: HttpHandler
	) {
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
			catchError(error => {
				if (
					error instanceof HttpErrorResponse &&
					!authReq.url.endsWith('auth') &&
					error.status === 401
				) {
					return this.handle401Error(authReq, next);
				}

				return throwError(error);
			})
		);
	}

	private handle401Error(request: HttpRequest<unknown>, next: HttpHandler) {
		if (!this.isRefreshing) {
			this.isRefreshing = true;
			this.accessTokenSubject$.next(null);

			const token = this._user.refreshToken$();

			if (token) {
				return this._user.refreshToken().pipe(
					switchMap((token ) => {
						this.isRefreshing = false;

						this.accessTokenSubject$.next(token.accessToken);
						return next.handle(this.addTokenHeader(request, token.accessToken));
					}),
					catchError(err => {
						this.isRefreshing = false;

						this._user.signout();
						return throwError(err);
					})
				);
			}
		}

		return this.accessTokenSubject$.pipe(
			filter((token ) => token !== null),
			take(1),
			switchMap((token) => next.handle(this.addTokenHeader(request, token as string)))
		);
	}

	private addTokenHeader(request: HttpRequest<unknown>, token: string) {
		return request.clone({
			headers: request.headers.set('Authorization', `Bearer ${token}`),
		});
	}
}
