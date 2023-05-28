import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@prisma';
import { MESSAGE_PREFIX } from '@util';
import { getHours } from 'date-fns';
import { ChannelType, Client } from 'discord.js';
import { createQuestionEmbed } from '../util/create-question-embed';
@Injectable()
export class BookwormQuestionService {
	private readonly _logger = new Logger(BookwormQuestionService.name);

	public questions = [
		'What are you reading?',
		'Who is your current book boyfriend?',
		'Do you picture celebrities for characters as you’re reading a book?',
		'Do you listen to music while reading?',
		'Do you read more than one book at a time?',
		'Do you re-read books?',
		'What are your thoughts on cliffhangers?',
		'Do you read duets?',
		'Do you enjoy love triangles?',
		'If you could read one trope for the rest of your life what would it be?',
		'If you were stranded on an island and your kindle didn’t work and you only had a handful of books what would you bring?',
		'What was your last five star read?',
		'Do you listen to bookish podcasts?',
		'What is something you won’t read?',
		'What book got you into reading?',
		'Do you use Goodreads?',
		'Do you write book reviews?',
		'What is your favorite genre?',
		'Do you have a favorite type of shifter?',
		'What is your guilty pleasure when it comes to romance clichés?',
		'Slow Burn or Insta-love?',
		'Friends to Lovers or Enemies to Lovers?',
		'Who is your go to romcom author?',
		'Who is your go to angsty author?',
		'Do you read on your cell phone?',
		'What is your favorite reading snack?',
		'Are you in a book club?',
		'Do you have any friends IRL that read?',
		'Have you ever written or tried to write a book?',
		'What made you pick up your current read?',
		'Do you have a library card?',
		'Do you listen to audio books?',
		'What is the last book you read that has become a movie or tv show?',
		'Do you browse book shops or go in with a purpose?',
		'Have any books really impacted your life?',
		'What book are you looking forward to?',
		'Do you have a go to book recommendation?',
		'What was your last non-fiction read?',
		'Do you have a favorite author?',
		'Do you read historical? If yes, what’s your favorite?',
		'Paperback or hardback?',
		'Where do you buy physical books?',
		'Do you sniff your books?',
		'What was the last book you bought because you saw it on Instagram?',
		'Do you read book reviews?',
		'What was the last book you bought because of the cover?',
		'What book did you love, but didn’t like the cover?',
		'Do you loan your books?',
		'Do you dog-ear your pages?',
		'Do you have kindle unlimited?',
		'Do you have the audible romance package?',
		'Do you read poetry?',
		'Do you read Wattpad?',
		'Do you read ebooks on a platform other than kindle or the kindle app?',
		'What is your favorite book blog or media site?',
		'What was the last movie you saw that was based on a book?',
		'Have you been to a book signing?',
		'What author do you most want to meet?',
		'Do you have a favorite fiction family?',
		'Who is an author you think more people need to read?',
		'If you could have any book adapted into a tv show or movie, what would it be?',
		'If you could pick any heroine to be your bff who would it be?',
		'Do you read holiday themed books?',
		'You woke up in the setting of the last book you read… where are you?',
		'Can you pick a song to describe your last read?',
		'What is your must have bookish merch?',
		'What is your favorite bookish candle?',
		'When was the last time you dnf’d a book?',
		'What do you want to see more of in romance?',
		'What is a romance trend that you miss?',
		'Do you get monthly book boxes?',
		'Do you collect multiple editions of one book?',
		'What’s your favorite thing from a book box?',
		'Do you do the Goodreads reading challenge?',
		'Do you participate in Popsugar’s reading challenge?',
		'How many books do you read a year on average?',
		'Do you have a blog/booktube/bookstagram account?',
		'What book has been on your tbr forever, but you just haven’t gotten to it?',
		'Where do you read?',
		'What is a popular book that you’ve never read?',
		'Do you have a favorite meet cute from a book?',
		'What is your go-to ugly cry?',
		'Have one of your favorite characters ever been killed off?',
		'What was your last ugly cry?',
		'Have you ever read a book based in the city you are from or close to you?',
		'What was the last audio book you listened to?',
		'What was the last book you recommended?',
		'What was the last book that was recommended to you?',
		'What is the farthest you’ve driven to meet an author.',
		'What is a popular book that you didn’t like?',
		'Do you like retellings?',
		'Do you read fanfiction?',
		'What is your go to drink while reading?',
		'Where is the strangest place you have hidden to read?',
		'Have you ever called into work so that you could stay home and read?',
		'Do you highlight your favorite quotes while reading?',
		'Do you prefer to read characters your age?',
		'Do you enjoy your books a little on the taboo side?',
		'Do you wait for a series to be completed before you read it?',
		'What was the last book you bought?',
		'What was your favorite book as a child?',
	];

	constructor(private _prisma: PrismaService, private _client: Client) {}

	async get(getRandom = false, guildId?: string) {
		if (getRandom) {
			const min = 0;
			const max = this.questions.length - 1;

			return this.questions[
				Math.floor(Math.random() * (max - min + 1)) + min
			];
		}

		if (!guildId) {
			return;
		}

		let index = 0;
		const latestLog = await this._prisma.bookwormLog.findFirst({
			where: {
				guildId,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		if (latestLog) {
			index = latestLog.index! + 1;
		}

		if (index >= this.questions.length - 1) {
			index = 0;
		}

		await this._prisma.bookwormLog.create({
			data: {
				guildId,
				index,
			},
		});

		return this.questions[index];
	}

	@Cron('0 0 * * * *')
	async checkDaily() {
		this._logger.log('Checking for bookworm daily question.');

		const hour = getHours(new Date());
		const settings = await this._prisma.settings.findMany({
			where: {
				bookwormDailyHour: hour,
				bookwormChannelId: {
					not: null,
				},
				bookwormEnabled: true,
				bookwormDailyEnabled: true,
			},
		});

		for (const {
			guildId,
			bookwormDailyChannelId,
			bookwormPingRoleId,
		} of settings) {
			if (!bookwormDailyChannelId) {
				continue;
			}

			const guild = await this._client.guilds.fetch(guildId);
			const channel = await guild.channels.fetch(bookwormDailyChannelId);
			const question = await this.get(false, guildId);

			if (!question) {
				continue;
			}

			if (channel?.type === ChannelType.GuildText) {
				const embed = createQuestionEmbed(
					`${MESSAGE_PREFIX} Daily bookworm question`,
					question,
					this._client.user!,
				);
				const content = bookwormPingRoleId
					? `<@&${bookwormPingRoleId}>`
					: '';
				await channel.send({ embeds: [embed], content });
			}
		}
	}
}
