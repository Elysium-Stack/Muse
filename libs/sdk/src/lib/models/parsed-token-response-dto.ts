/* tslint:disable */
/* eslint-disable */

import { WhoamiDiscordResponseDto } from './whoami-discord-response-dto';
export interface ParsedTokenResponseDto {

  /**
   * The user's access token.
   */
  accessToken?: string;

  /**
   * The discord user of the user.
   */
  discord: WhoamiDiscordResponseDto;

  /**
   * Experation time of the access token.
   */
  exp: number;

  /**
   * Time of issuing the access token.
   */
  iat: number;

  /**
   * The user's refresh token.
   */
  refreshToken?: string;

  /**
   * ID of the user.
   */
  sub: number;
}
