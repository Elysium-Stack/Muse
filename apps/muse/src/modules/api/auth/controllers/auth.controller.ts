import type { AuthenticatedRequestDTO } from '@muse/types/authenticated-request.type';
import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
	ParsedTokenResponseDTO,
	TokensResponseDTO,
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
		@Request() req: AuthenticatedRequestDTO,
		@Query('code') code: string
	): TokensResponseDTO {
		return req.user as TokensResponseDTO;
	}

	/**
	 * Get the current users information.
	 */
	@Get('me')
	@UseGuards(AccessTokenGuard)
	whoami(@Request() req: AuthenticatedRequestDTO): ParsedTokenResponseDTO {
		return req.user as ParsedTokenResponseDTO;
	}

	/**
	 * Invalidate tokens for current user
	 */
	@Get('logout')
	@UseGuards(AccessTokenGuard)
	logout(@Request() req: AuthenticatedRequestDTO) {
		this._authService.signout(req.user.sub);
	}

	/**
	 * Refresh the access token using the refresh token
	 */
	@Get('refresh')
	@UseGuards(RefreshTokenGuard)
	refresh(@Request() req: AuthenticatedRequestDTO): Promise<TokensResponseDTO> {
		const userId = req.user.sub;
		const refreshToken = req.user.refreshToken!;
		return this._authService.refreshTokens(userId, refreshToken);
	}
}
