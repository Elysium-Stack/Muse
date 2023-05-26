import type { AuthenticatedRequest } from '@muse/types/authenticated-request.type';
import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
	ParsedTokenResponse,
	TokensResponse,
} from '../../../../types/responses.type';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { DiscordOAuthGuard } from '../guards/discord-oauth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { AuthService } from '../services';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
	constructor(private _authService: AuthService) {}

	/**
	 * Authenticate the user with discord.
	 */
	@Get()
	@UseGuards(DiscordOAuthGuard)
	async auth() {}

	/**
	 * Trade in discord code for a jwt token
	 */
	@Get('callback')
	@UseGuards(DiscordOAuthGuard)
	callback(
		@Request() req: AuthenticatedRequest,
		@Query('code') code: string,
	): TokensResponse {
		return req.user as TokensResponse;
	}

	/**
	 * Get the current users information.
	 */
	@Get('me')
	@UseGuards(AccessTokenGuard)
	whoami(@Request() req: AuthenticatedRequest): ParsedTokenResponse {
		return req.user as ParsedTokenResponse;
	}

	/**
	 * Invalidate tokens for current user
	 */
	@Get('logout')
	@UseGuards(AccessTokenGuard)
	logout(@Request() req: AuthenticatedRequest) {
		this._authService.signout(req.user.sub);
	}

	/**
	 * Refresh the access token using the refresh token
	 */
	@Get('refresh')
	@UseGuards(RefreshTokenGuard)
	refresh(@Request() req: AuthenticatedRequest): Promise<TokensResponse> {
		const userId = req.user.sub;
		const refreshToken = req.user.refreshToken!;
		return this._authService.refreshTokens(userId, refreshToken);
	}
}
