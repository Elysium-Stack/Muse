import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
	ApiForbiddenResponse,
	ApiOkResponse,
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { DiscordOAuthGuard } from '../guards/discord-oauth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { AuthService } from '../services';
import { TokensResponse, WhoamiResponse } from '../types/responses.type';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
	constructor(private _authService: AuthService) {}

	@Get()
	@UseGuards(DiscordOAuthGuard)
	@ApiOperation({ summary: 'Authenticate user against discord oauth2 api' })
	@ApiResponse({
		status: 301,
		description: 'Redirect to discord oauth2 screen.',
	})
	@ApiUnauthorizedResponse({ description: 'Unauthorized.' })
	async auth() {}

	@Get('callback')
	@UseGuards(DiscordOAuthGuard)
	@ApiOperation({ summary: 'Discord oauth2 code callback' })
	@ApiOkResponse({ type: TokensResponse })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized.' })
	callback(
		@Request() req,
		@Query('code') code: string,
	): Promise<TokensResponse> {
		return req.user;
	}

	@Get('me')
	@UseGuards(AccessTokenGuard)
	@ApiOperation({
		summary: "Retrieve the current user from it's access token",
	})
	@ApiOkResponse({ type: WhoamiResponse })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized.' })
	whoami(@Request() req): Promise<WhoamiResponse> {
		return req.user;
	}

	@Get('logout')
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: "Invalidate the current user's tokens" })
	logout(@Request() req) {
		this._authService.signout(req.user.sub);
	}

	@Get('refresh')
	@UseGuards(RefreshTokenGuard)
	@ApiOperation({
		summary: "Refresh the current user's token with it's refresh token",
	})
	@ApiOkResponse({ type: TokensResponse })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized.' })
	refresh(@Request() req): Promise<TokensResponse> {
		const userId = req.user.sub;
		const refreshToken = req.user.refreshToken;
		return this._authService.refreshTokens(userId, refreshToken);
	}
}
