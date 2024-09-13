import { HttpClient, HttpResponse, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { ApiConfiguration } from '../api-configuration';
import { BaseService } from '../base-service';
import { RequestBuilder } from '../request-builder';
import { StrictHttpResponse } from '../strict-http-response';


@Injectable({
	providedIn: 'root',
})
export class ApiService extends BaseService {
	constructor(config: ApiConfiguration, http: HttpClient) {
		super(config, http);
	}

	/**
	 * Path part for operation prometheusControllerIndex
	 */
	static readonly PrometheusControllerIndexPath = '/api/metrics';

	/**
	 * This method provides access to the full `HttpResponse`, allowing access to response headers.
	 * To access only the response body, use `prometheusControllerIndex()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	prometheusControllerIndex$Response(
		_: unknown,
		context?: HttpContext
	): Observable<StrictHttpResponse<void>> {
		const rb = new RequestBuilder(
			this.rootUrl,
			ApiService.PrometheusControllerIndexPath,
			'get'
		);

		return this.http
			.request(
				rb.build({
					responseType: 'text',
					accept: '*/*',
					context: context,
				})
			)
			.pipe(
				filter((r) => r instanceof HttpResponse),
				map((r) => {
					return (r as HttpResponse<unknown>).clone({
						body: undefined,
					}) as StrictHttpResponse<void>;
				})
			);
	}

	/**
	 * This method provides access only to the response body.
	 * To access the full response (for headers, for example), `prometheusControllerIndex$Response()` instead.
	 *
	 * This method doesn't expect any request body.
	 */
	prometheusControllerIndex(
		params?: unknown,
		context?: HttpContext
	): Observable<void> {
		return this.prometheusControllerIndex$Response(params, context).pipe(
			map((r: StrictHttpResponse<void>) => r.body as void)
		);
	}
}
