/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpContext } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { ParsedTokenResponseDto } from '../models/parsed-token-response-dto';
import { TokensResponseDto } from '../models/tokens-response-dto';

@Injectable({
	providedIn: 'root',
})
export class AuthService extends BaseService {
	constructor(config: ApiConfiguration, http: HttpClient) {
		super(config, http);
	}

	/**
	 * Path part for operation authControllerAuth
	 */
	static readonly AuthControllerAuthPath = '/api/auth';

	/**
	 * Authenticate the user with discord.
	 *
	 * This method provides access to the full `HttpResponse`, allowing access to response headers.
	 * To access only the response body, use `authControllerAuth()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	authControllerAuth$Response(
		params?: {},
		context?: HttpContext
	): Observable<StrictHttpResponse<void>> {
		const rb = new RequestBuilder(
			this.rootUrl,
			AuthService.AuthControllerAuthPath,
			'get'
		);
		if (params) {
		}

		return this.http
			.request(
				rb.build({
					responseType: 'text',
					accept: '*/*',
					context: context,
				})
			)
			.pipe(
				filter((r: any) => r instanceof HttpResponse),
				map((r: HttpResponse<any>) => {
					return (r as HttpResponse<any>).clone({
						body: undefined,
					}) as StrictHttpResponse<void>;
				})
			);
	}

	/**
	 * Authenticate the user with discord.
	 *
	 * This method provides access only to the response body.
	 * To access the full response (for headers, for example), `authControllerAuth$Response()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	authControllerAuth(params?: {}, context?: HttpContext): Observable<void> {
		return this.authControllerAuth$Response(params, context).pipe(
			map((r: StrictHttpResponse<void>) => r.body as void)
		);
	}

	/**
	 * Path part for operation authControllerCallback
	 */
	static readonly AuthControllerCallbackPath = '/api/auth/callback';

	/**
	 * Trade in discord code for a jwt token
	 *
	 * This method provides access to the full `HttpResponse`, allowing access to response headers.
	 * To access only the response body, use `authControllerCallback()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	authControllerCallback$Response(
		params: {
			code: string;
		},
		context?: HttpContext
	): Observable<StrictHttpResponse<TokensResponseDto>> {
		const rb = new RequestBuilder(
			this.rootUrl,
			AuthService.AuthControllerCallbackPath,
			'get'
		);
		if (params) {
			rb.query('code', params.code, {});
		}

		return this.http
			.request(
				rb.build({
					responseType: 'json',
					accept: 'application/json',
					context: context,
				})
			)
			.pipe(
				filter((r: any) => r instanceof HttpResponse),
				map((r: HttpResponse<any>) => {
					return r as StrictHttpResponse<TokensResponseDto>;
				})
			);
	}

	/**
	 * Trade in discord code for a jwt token
	 *
	 * This method provides access only to the response body.
	 * To access the full response (for headers, for example), `authControllerCallback$Response()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	authControllerCallback(
		params: {
			code: string;
		},
		context?: HttpContext
	): Observable<TokensResponseDto> {
		return this.authControllerCallback$Response(params, context).pipe(
			map(
				(r: StrictHttpResponse<TokensResponseDto>) =>
					r.body as TokensResponseDto
			)
		);
	}

	/**
	 * Path part for operation authControllerWhoami
	 */
	static readonly AuthControllerWhoamiPath = '/api/auth/me';

	/**
	 * Get the current users information.
	 *
	 * This method provides access to the full `HttpResponse`, allowing access to response headers.
	 * To access only the response body, use `authControllerWhoami()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	authControllerWhoami$Response(
		params?: {},
		context?: HttpContext
	): Observable<StrictHttpResponse<ParsedTokenResponseDto>> {
		const rb = new RequestBuilder(
			this.rootUrl,
			AuthService.AuthControllerWhoamiPath,
			'get'
		);
		if (params) {
		}

		return this.http
			.request(
				rb.build({
					responseType: 'json',
					accept: 'application/json',
					context: context,
				})
			)
			.pipe(
				filter((r: any) => r instanceof HttpResponse),
				map((r: HttpResponse<any>) => {
					return r as StrictHttpResponse<ParsedTokenResponseDto>;
				})
			);
	}

	/**
	 * Get the current users information.
	 *
	 * This method provides access only to the response body.
	 * To access the full response (for headers, for example), `authControllerWhoami$Response()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	authControllerWhoami(
		params?: {},
		context?: HttpContext
	): Observable<ParsedTokenResponseDto> {
		return this.authControllerWhoami$Response(params, context).pipe(
			map(
				(r: StrictHttpResponse<ParsedTokenResponseDto>) =>
					r.body as ParsedTokenResponseDto
			)
		);
	}

	/**
	 * Path part for operation authControllerLogout
	 */
	static readonly AuthControllerLogoutPath = '/api/auth/logout';

	/**
	 * Invalidate tokens for current user
	 *
	 * This method provides access to the full `HttpResponse`, allowing access to response headers.
	 * To access only the response body, use `authControllerLogout()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	authControllerLogout$Response(
		params?: {},
		context?: HttpContext
	): Observable<StrictHttpResponse<void>> {
		const rb = new RequestBuilder(
			this.rootUrl,
			AuthService.AuthControllerLogoutPath,
			'get'
		);
		if (params) {
		}

		return this.http
			.request(
				rb.build({
					responseType: 'text',
					accept: '*/*',
					context: context,
				})
			)
			.pipe(
				filter((r: any) => r instanceof HttpResponse),
				map((r: HttpResponse<any>) => {
					return (r as HttpResponse<any>).clone({
						body: undefined,
					}) as StrictHttpResponse<void>;
				})
			);
	}

	/**
	 * Invalidate tokens for current user
	 *
	 * This method provides access only to the response body.
	 * To access the full response (for headers, for example), `authControllerLogout$Response()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	authControllerLogout(params?: {}, context?: HttpContext): Observable<void> {
		return this.authControllerLogout$Response(params, context).pipe(
			map((r: StrictHttpResponse<void>) => r.body as void)
		);
	}

	/**
	 * Path part for operation authControllerRefresh
	 */
	static readonly AuthControllerRefreshPath = '/api/auth/refresh';

	/**
	 * Refresh the access token using the refresh token
	 *
	 * This method provides access to the full `HttpResponse`, allowing access to response headers.
	 * To access only the response body, use `authControllerRefresh()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	authControllerRefresh$Response(
		params?: {},
		context?: HttpContext
	): Observable<StrictHttpResponse<TokensResponseDto>> {
		const rb = new RequestBuilder(
			this.rootUrl,
			AuthService.AuthControllerRefreshPath,
			'get'
		);
		if (params) {
		}

		return this.http
			.request(
				rb.build({
					responseType: 'json',
					accept: 'application/json',
					context: context,
				})
			)
			.pipe(
				filter((r: any) => r instanceof HttpResponse),
				map((r: HttpResponse<any>) => {
					return r as StrictHttpResponse<TokensResponseDto>;
				})
			);
	}

	/**
	 * Refresh the access token using the refresh token
	 *
	 * This method provides access only to the response body.
	 * To access the full response (for headers, for example), `authControllerRefresh$Response()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	authControllerRefresh(
		params?: {},
		context?: HttpContext
	): Observable<TokensResponseDto> {
		return this.authControllerRefresh$Response(params, context).pipe(
			map(
				(r: StrictHttpResponse<TokensResponseDto>) =>
					r.body as TokensResponseDto
			)
		);
	}
}
