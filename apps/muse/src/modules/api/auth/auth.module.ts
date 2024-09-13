import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { SharedModule } from '@muse/shared.module';

import { AuthSharedModule } from './auth.shared.module';
import { AuthController } from './controllers/auth.controller';
import { AccessTokenStrategy } from './services/access-token.strategy';
import { DiscordStrategy } from './services/discord.strategy';
import { RefreshTokenStrategy } from './services/refresh-token.strategy';

@Module({
	imports: [
		SharedModule,
		AuthSharedModule,
		PassportModule,
		JwtModule.register({}),
	],
	controllers: [AuthController],
	providers: [DiscordStrategy, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
