export interface BookwormSettingsInterface {
	enabled: boolean;
	channelId?: string;
	dailyEnabled: boolean;
	dailyHour: number;
	dailyChannelId?: string;
	pingEnabled: boolean;
	pingRoleId?: string;
}
