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
		'What was your favorite book as a child?',
		'What is your favorite memory of the library?',
		'Who are your top 3 favourite authors?',
		"What's your favourite book series?",
		"What's your favourite standalone book?",
		"What's your favourite bookstore?",
		"What's your favourite opening line from a novel?",
		'What are your top 3 favorite series of all time?',
		"What's your favourite romcom?",
		"What's your favourite fairytale?",
		"What's your favourite fandom?",
		'What was your favourite read of this year?',
		"What's your favourite YA book?",
		"What's your favourite historical fiction book?",
		"What's your favourite nonfiction book?",
		'Describe your favourite book in 5 emojis or less.',
		'What is your favourite platonic relationship from a book?',
		'Who are your favourite book villains?',
		'What are your favourite short stories?',
		"What's your favourite classic poetry book?",
		'Do you prefer to read indoors or outdoors?',
		'Do you like to read at the library?',
		'Do you prefer to read at a coffee shop or at home?',
		'Do you prefer mini reviews or lengthy reviews?',
		'Do you have a dedicated reading spot in your house?',
		'How much time do you usually spend reading in a week?',
		'Do you prefer books with one POV or multiple POVs?',
		'What time of day do you prefer to read?',
		'Do you like to have the TV on in the background while you read?',
		"What's the last book series you started, and what's the last book series you finished?",
		'What book is next on your TBR list?',
		'Do you like coffee table books? (and if so, what book is on your coffee table?)',
		'What are your most anticipated new books of this year?',
		'How do you organize your bookshelves?',
		'What book do you wish you could gift your younger self?',
		'What book are you most likely to gift to a friend?',
		'Have you ever bought a second copy of a book just because it had a different cover?',
		'Have you ever accidentally bought the same book twice?',
		'How many books have you read so far this year?',
		"What's the last book you added to your TBR?",
		'How many books are on your nightstand right now?',
		'What fantasy world would you most like to live in?',
		"What's the last book you binge read?",
		'How many books do you wish you could read in a year?',
		"What's the longest book you've ever read?",
		'Do you like long books?',
		'How many books do you read per month?',
		"What's the best book you've read so far this year?",
		"What's the last book that made you cry?",
		"What's the last book that made you swoon? ",
		"What's the last nonfiction book you read?",
		'How many books are on your TBR list?',
		"What's the last book you read that has a map in it?",
		"What's the last book you read that broke your heart?",
		'If you were transported to the book you are reading right now, what would your life look like?',
		"What's the last book that made you laugh out loud?",
		"If you could have the magic powers from any book you've read, which one would you want?",
		'Have you ever met an author? (Who?)',
		'Describe the last book you read in 5 emojis or less',
		'What fictional universe would you like to visit?',
		'What character from a book would you want to ask on a date? Where would you go?',
		'What character from a book do you wish was your friend? Why?',
		'Do you prefer books written in 1st or 3rd person?',
		'Have you ever read an ARC (Advanced Reader Copy)?',
		'What character names have annoyed you, and what are your favorite character names?',
		'Which book do you consider a hidden gem?',
		'What author have you never read but always wanted to?',
		'What book character reminds you of yourself?',
		'What bookish merch would you like to own?',
		'Which book villain could you just not stand?',
		'Have you attended a book convention?',
		'What standalone book do you wish had a sequel?',
		'What bookstore would you most like to visit?',
		'What library would you most like to visit?',
		'Do you keep a journal?',
		'What was your first read of this year? And do you choose a book to start the year with ahead of time?',
		"Do you set a goal each year for how many books you'd like to read?",
		'Do you have a bad book habit?',
		'How often do you read out of your comfort zone?',
		'Can you read on public transport?',
		'Do you break/crack the spine of your books?',
		'Do you annotate your books? If so, what are your favorite book annotation supplies?',
		'What is your favourite language to read in?',
		"What's the most intimidating book you've read?",
		'Name a book that made you angry, and why.',
		'Do you skim a book before reading it?',
		"What's the most money you've ever spent in a bookstore at one time?",
		'How often do you return books to the library unread?',
		'If you could turn any book into a movie, which would you choose?',
		'What time of day do you read the most? For example, do you read more during the morning, mid-day, or at night?',
		'What time of the year do you read the most?',
		'Has a specific book ever pulled you out of a reading slump? If so, what book was it?',
		'Do you prefer book covers with images on the front or book covers with typography on the front?',
		'Have you been a reader your whole life or did you start reading recently?',
		'If you were going to a deserted island, what are the 3 books you would take with you?',
		'What is your favorite time period to read about?',
		'Did your parents or guardians read to you when you were young?',
		'Have you ever made a playlist for a book you are reading?',
		'Have you ever dressed up as a book character for Halloween, cosplay, etc?',
		'Where do you get most of the books you read? Amazon, library, book store, etc. ',
		'What is your favorite bookish accessory? (Bookmarks, book sleeves, reading lights, etc.)',
		'Which do you prefer, strong characterization or strong world-building?',
		'If someone wrote a book about your own life, would you be the hero or the villian?',
		'Do you read specific genres during specific seasons? For example, do you read more horror in the fall and more romance in the spring?',
		'How do you keep track of the books you read? Through an app like Goodreads, a reading journal, or something else?',
		'If you were creating a movie for your favourite book, who would you cast as the main characters?',
		'Has a book ever scared you or given you nightmares?',
		'Are there any books that are considered terrible but are your secret pleasure?',
		'In general, do you think books are better or worse now than they used to be?',
		'Where do you usually discover new books? Physical bookstores? Online? Social media?',
		'Think about your favourite genre. To you, which author is the master of that genre?',
		'Do you judge a book by its cover? Would a shoddy cover put you off?',
		'Do certain tropes attract you? For example, orphans, love triangles, anti-heroes?',
		"Are you generally good at guessing twists or being able to see what's coming? Have any stories genuinely shocked you?",
		'What fictional squad/friendship group would you love to be a part of?',
		'If you could erase a book from your brain and experience it for the first time again, which book would you choose?',
		'Do you ever watch booktube/authortube videos?',
		"What's your favorite weather to read in?",
		"What's your favorite book that you had to read because of school?",
		'How do you decide what book to read next?',
		'If you could take a class on anything taught by any fictional character, what and who would it be?',
		"What's your reading routine? Does it change often? ",
		'If you were to own a bookstore, what would it be like? How would you arrange the books? Would you serve coffee and food? Play music? Where would it be? ',
		'Would you rather read one long (900ish-pages) book or three shorter (300-ish pages) books?',
		'Have you ever had a "meet-cute" thanks to books? For instance, gotten a DM on IG? A chat in a bookstore? A random connection on a bus or in line? ',
		'What are your thoughts on Prologues and Epilogues?',
		'Would you rather meet your favorite author or favorite character?',
		'Would you rather be a librarian or a bookseller?',
		'Favorite LGBTQ+ reads?',
		'How many books do you own?',
		'How many books do you carry while traveling?',
		'Do you like books with maps? Which is your favorite bookish map?',
		'Do you have a favourite bookmark to use?',
		"What's a book based on a real life incident that you love?",
		'Did you ever read in a completely inappropriate location or situation?',
		'Be allowed to only read new books or to never be allowed to read anything else than what you read before?',
		'Read 100 books this year and never be allowed to read again, or read 1 book per year for the rest of your life?',
		'Read a book that is really well written but has a terrible story, or the other way around?',
		"Hear a spoiler of a book's ending or never find out how it ends?",
		"What's the quickest you've ever read a book and what book was it?",
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
