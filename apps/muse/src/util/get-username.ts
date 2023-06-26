import { User } from "discord.js";

export const getUsername = (user: User) => `${user.username}${user.discriminator === '0' ? '' : `#${user.discriminator}`}`;