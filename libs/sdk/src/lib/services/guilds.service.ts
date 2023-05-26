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

/* This is a test comment */
import { Users } from '../models/users';

@Injectable({
  providedIn: 'root',
})
export class GuildsService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation guildsControllerGuilds
   */
  static readonly GuildsControllerGuildsPath = '/api/discord/guilds';

  /**
   * Get the current users discord guilds
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `guildsControllerGuilds()` instead.
   *
   * This method doesn't expect any request body.
   */
  guildsControllerGuilds$Response(params?: {
  },
  context?: HttpContext

): Observable<StrictHttpResponse<Array<Users>>> {

    const rb = new RequestBuilder(this.rootUrl, GuildsService.GuildsControllerGuildsPath, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Users>>;
      })
    );
  }

  /**
   * Get the current users discord guilds
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `guildsControllerGuilds$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  guildsControllerGuilds(params?: {
  },
  context?: HttpContext

): Observable<Array<Users>> {

    return this.guildsControllerGuilds$Response(params,context).pipe(
      map((r: StrictHttpResponse<Array<Users>>) => r.body as Array<Users>)
    );
  }

  /**
   * Path part for operation guildsControllerTest
   */
  static readonly GuildsControllerTestPath = '/api/discord/guilds/test';

  /**
   * This is a test
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `guildsControllerTest()` instead.
   *
   * This method doesn't expect any request body.
   */
  guildsControllerTest$Response(params?: {
  },
  context?: HttpContext

): Observable<StrictHttpResponse<Array<Users>>> {

    const rb = new RequestBuilder(this.rootUrl, GuildsService.GuildsControllerTestPath, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Users>>;
      })
    );
  }

  /**
   * This is a test
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `guildsControllerTest$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  guildsControllerTest(params?: {
  },
  context?: HttpContext

): Observable<Array<Users>> {

    return this.guildsControllerTest$Response(params,context).pipe(
      map((r: StrictHttpResponse<Array<Users>>) => r.body as Array<Users>)
    );
  }

}