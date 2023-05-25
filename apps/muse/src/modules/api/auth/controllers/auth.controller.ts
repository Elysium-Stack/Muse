import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { DiscordOAuthGuard } from '../guards/discord-oauth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { AuthService } from '../services';

@Controller('auth')
export class AuthController {
	constructor(private _authService: AuthService) {}

	@Get()
	@UseGuards(DiscordOAuthGuard)
	async auth() {}

	@Get('callback')
	@UseGuards(DiscordOAuthGuard)
	callback(@Request() req) {
		return req.user;
	}

	@UseGuards(AccessTokenGuard)
	@Get('me')
	whoami(@Request() req) {
		return req.user;
	}

	@UseGuards(AccessTokenGuard)
	@Get('logout')
	logout(@Request() req) {
		this._authService.signout(req.user.sub);
	}

	@UseGuards(RefreshTokenGuard)
	@Get('refresh')
	refresh(@Request() req) {
		const userId = req.user.sub;
		const refreshToken = req.user.refreshToken;
		return this._authService.refreshTokens(userId, refreshToken);
	}
}
