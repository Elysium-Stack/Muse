import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { getHours } from 'date-fns';
import { ChannelType, Client } from 'discord.js';

import { createQuestionEmbed } from '../util/create-question-embed';

import { PrismaService } from '@prisma';

import { MESSAGE_PREFIX } from '@util';
@Injectable()
export class QotDQuestionService {
	private readonly _logger = new Logger(QotDQuestionService.name);

	public questions = [
		'What weird food combinations do you really enjoy?',
		'What social stigma does society need to get over?',
		'What food have you never eaten but would really like to try?',
		'What’s something you really resent paying for?',
		'What would a world populated by clones of you be like?',
		'Do you think that aliens exist?',
		'What are you currently worried about?',
		'Where are some unusual places you’ve been?',
		'Where do you get your news?',
		'What are some red flags to watch out for in daily life?',
		'What movie can you watch over and over without ever getting tired of?',
		'When you are old, what do you think children will ask you to tell stories about?',
		'If you could switch two movie characters, what switch would lead to the most inappropriate movies?',
		'What inanimate object would be the most annoying if it played loud upbeat music while being used?',
		'When did something start out badly for you but in the end, it was great?',
		'How would your country change if everyone, regardless of age, could vote?',
		'What animal would be cutest if scaled down to the size of a cat?',
		'If your job gave you a surprise three day paid break to rest and recuperate, what would you do with those three days?',
		'What’s wrong but sounds right?',
		'What’s the most epic way you’ve seen someone quit or be fired?',
		'If you couldn’t be convicted of any one type of crime, what criminal charge would you like to be immune to?',
		'What’s something that will always be in fashion, no matter how much time passes?',
		'What actors or actresses play the same character in almost every movie or show they do?',
		'In the past people were buried with the items they would need in the afterlife, what would you want buried with you so you could use it in the afterlife?',
		'What’s the best / worst practical joke that you’ve played on someone or that was played on you?',
		'Who do you go out of your way to be nice to?',
		'Where do you get most of the decorations for your home?',
		'What food is delicious but a pain to eat?',
		'Who was your craziest / most interesting teacher?',
		'What “old person” things do you do?',
		'What was the last photo you took?',
		'What is the most amazing slow motion video you’ve seen?',
		'Which celebrity do you think is the most down to earth?',
		'What would be the worst thing to hear as you are going under anesthesia before heart surgery?',
		'What’s the spiciest thing you’ve ever eaten?',
		'What’s the most expensive thing you’ve broken?',
		'What obstacles would be included in the World’s most amazing obstacle course?',
		'What makes you roll your eyes every time you hear it?',
		'What do you think you are much better at than you actually are?',
		'Should kidneys be able to be bought and sold?',
		'What’s the most creative use of emojis you’ve ever seen?',
		'When was the last time you got to tell someone “I told you so.”?',
		'What riddles do you know?',
		'What’s your cure for hiccups?',
		'What invention doesn’t get a lot of love, but has greatly improved the world?',
		'What’s the most interesting building you’ve ever seen or been in?',
		'What mythical creature do you wish actually existed?',
		'What are your most important rules when going on a date?',
		'How do you judge a person?',
		'If someone narrated your life, who would you want to be the narrator?',
		'What was the most unsettling film you’ve seen?',
		'What unethical experiment would have the biggest positive impact on society as a whole?',
		'When was the last time you were snooping, and found something you wish you hadn’t?',
		'Which celebrity or band has the worst fan base?',
		'What are you interested in that most people aren’t?',
		'If you were given a PhD degree, but had no more knowledge of the subject of the degree besides what you have now, what degree would you want to be given to you?',
		'What smartphone feature would you actually be excited for a company to implement?',
		'What’s something people don’t worry about but really should?',
		'What movie quotes do you use on a regular basis?',
		'Do you think that children born today will have better or worse lives than their parents?',
		'What’s the funniest joke you know by heart?',
		'When was the last time you felt you had a new lease on life?',
		'What’s the funniest actual name you’ve heard of someone having?',
		'Which charity or charitable cause is most deserving of money?',
		'What TV show character would it be the most fun to change places with for a week?',
		'What was cool when you were young but isn’t cool now?',
		'If you were moving to another country, but could only pack one carry-on sized bag, what would you pack?',
		'What’s the most ironic thing you’ve seen happen?',
		'If magic was real, what spell would you try to learn first?',
		'If you were a ghost and could possess people, what would you make them do?',
		'What goal do you think humanity is not focused enough on achieving?',
		'What problem are you currently grappling with?',
		'What character in a movie could have been great, but the actor they cast didn’t fit the role?',
		'What game have you spent the most hours playing?',
		'What’s the most comfortable bed or chair you’ve ever been in?',
		'What’s the craziest conversation you’ve overheard?',
		'What’s the hardest you’ve ever worked?',
		'What movie, picture, or video always makes you laugh no matter how often you watch it?',
		'What artist or band do you always recommend when someone asks for a music recommendation?',
		'If you could have an all-expenses paid trip to see any famous world monument, which monument would you choose?',
		'If animals could talk, which animal would be the most annoying?',
		'What’s the most addicted to a game you’ve ever been?',
		'What’s the coldest you’ve ever been?',
		'Which protagonist from a book or movie would make the worst roommate?',
		'Do you eat food that’s past its expiration date if it still smells and looks fine?',
		'What’s the most ridiculous thing you have bought?',
		'What’s the funniest comedy skit you’ve seen?',
		'What’s the most depressing meal you’ve eaten?',
		'What tips or tricks have you picked up from your job / jobs?',
		'What outdoor activity haven’t you tried, but would like to?',
		'What songs hit you with a wave of nostalgia every time you hear them?',
		'What’s the worst backhanded compliment you could give someone?',
		'What’s the most interesting documentary you’ve ever watched?',
		'What was the last song you sang along to?',
		'What’s the funniest thing you’ve done or had happen while your mind was wandering?',
		'What app can you not believe someone hasn’t made yet?',
		'When was the last time you face palmed?',
		'If you were given five million dollars to open a small museum, what kind of museum would you create?',
		'Which of your vices or bad habits would be the hardest to give up?',
		'What really needs to be modernized?',
		'When was the last time you slept more than nine hours?',
		'How comfortable are you speaking in front of large groups of people?',
		'What’s your worst example of procrastination?',
		'Who has zero filter between their brain and mouth?',
		'What was your most recent lie?',
		'When was the last time you immediately regretted something you said?',
		'What would be the best thing you could reasonably expect to find in a cave?',
		'What did you think was going to be amazing but turned out to be horrible?',
		'What bit of trivia do you know that is very interesting but also very useless?',
		'What’s the silliest thing you’ve seen someone get upset about?',
		'What animal or plant do you think should be renamed?',
		'What was the best thing that happened to you today?',
		'As a child, what did you think would be awesome about being an adult, but isn’t as awesome as you thought it would be?',
		'When is censorship warranted?',
		'What’s the most boring super hero you can come up with?',
		'What would be some of the downsides of certain superpowers?',
		'What word is a lot of fun to say?',
		'What current trend do you hope will go on for a long time?',
		'What actors or actresses can’t play a different character because they played their most famous character too well?',
		'Where’s your go to restaurant for amazing food?',
		'What’s something that all your friends agree on?',
		'What’s your best story from a wedding?',
		'What languages do you wish you could speak?',
		'What’s the most pleasant sounding accent?',
		'What’s something that everyone, absolutely everyone, in the entire world can agree on?',
		'What country is the strangest from your cultural stand point?',
		'What’s the funniest word in the English language?',
		'What’s some insider knowledge that only people in your line of work have?',
		'Who do you wish you could get back into contact with?',
		'How do you make yourself sleep when you can’t seem to get to sleep?',
		'If people receive a purple heart for bravery, what would other color hearts represent?',
		'What are some of the best vacations you’ve had?',
		'If there was a book of commandments for the modern world, what would some of the rules be?',
		'What’s the craziest video you’ve ever seen?',
		'What’s your “Back in my day, we…”?',
		'If you could know the truth behind every conspiracy, but you would instantly die if you hinted that you knew the truth, would you want to know?',
		'What animal would be the most terrifying if it could speak?',
		'What’s the worst hairstyle you’ve ever had?',
		'What habit do you have now that you wish you started much earlier?',
		'If you were given one thousand acres of land that you didn’t need to pay taxes on but couldn’t sell, what would you do with it?',
		'What about humans confuses you the most?',
		'When was the last time you yelled at someone?',
		'What’s the opposite of a koala?',
		'What kinds of things do you like to cook or are good at cooking?',
		'What life skills are rarely taught but extremely useful?',
		'What movie universe would be the worst to live out your life in?',
		'If you could hack into any one computer, which computer would you choose?',
		'Who do you feel like you know even though you’ve never met them?',
		'What’s the most ridiculous animal on the planet?',
		'What’s the worst thing you’ve eaten out of politeness?',
		'What’s the most historic thing that has happened in your lifetime?',
		'What happens in your country regularly that people in most countries would find strange or bizarre?',
		'What has been blown way out of proportion?',
		'When was a time you acted nonchalant but were going crazy inside?',
		'What’s about to get much better?',
		'What are some clever examples of misdirection you’ve seen?',
		'What’s your funniest story involving a car?',
		'What would be the click-bait titles of some popular movies?',
		'If you built a themed hotel, what would the theme be and what would the rooms look like?',
		'What scientific discovery would change the course of humanity overnight if it was discovered?',
		'Do you think that humans will ever be able to live together in harmony?',
		'What would your perfect bar look like?',
		'What’s the scariest non-horror movie?',
		'What’s the most amazing true story you’ve heard?',
		'What’s the grossest food that you just can’t get enough of?',
		'What brand are you most loyal to?',
		'What’s the most awkward thing that happens to you on a regular basis?',
		'If you had to disappear and start a whole new life, what would you want your new life to look like?',
		'What movie or book do you know the most quotes from?',
		'What was one of the most interesting concerts you’ve been to?',
		'Where are you not welcome anymore?',
		'What do you think could be done to improve the media?',
		'What’s the most recent show you’ve binge watched?',
		'What’s the worst movie trope?',
		'What’s a common experience for many people that you’ve never experienced?',
		'What are some misconceptions about your hobby?',
		'What’s the smartest thing you’ve seen an animal do?',
		'What’s the most annoying noise?',
		'What’s your haunted house story?',
		'What did you Google last?',
		'What’s the dumbest thing someone has argued with you about?',
		'If money and practicality weren’t a problem, what would be the most interesting way to get around town?',
		'What’s the longest rabbit hole you’ve been down?',
		'What’s the saddest scene in a movie or TV series?',
		'What’s the most frustrating product you own?',
		'What inconsequential super power would you like to have?',
		'What qualities do all your friends have in common?',
		'What odd smell do you really enjoy?',
		'What’s the coolest animal you’ve seen in the wild?',
		'What’s the best lesson you’ve learned from a work of fiction?',
		'What food do you crave most often?',
		'Who in your life has the best / worst luck?',
		'What fashion trend makes you cringe or laugh every time you see it?',
		'What’s your best story of you or someone else trying to be sneaky and failing miserably?',
		'Which apocalyptic dystopia do you think is most likely?',
		'If you had a HUD that showed three stats about any person you looked at, what three stats would you want it to show?',
		'What’s the funniest thing you’ve seen a kid do?',
		'What’s your secret talent?',
		'What’s the best way you or someone you know has gotten out of a ticket / trouble with the law?',
		'Tear gas makes people cry and laughing gas makes people giggle, what other kinds of gases do you wish existed?',
		'What’s the most beautiful beach you’ve been to?',
		'What’s the most anxiety inducing thing you do on a regular basis?',
		'What’s something that everyone agrees we should change, but somehow it never changes?',
		'What trend are you tired of?',
		'What’s incredibly cheap and you would pay way more for?',
		'What’s your grossest bug story?',
		'What would the adult version of an ice-cream truck sell and what song would it play?',
		'What company do you despise?',
		'When was the most inappropriate time you busted out in laughter?',
		'What would be an accurate tag line for each month?',
		'What’s the most overrated product out on the market?',
		'What word do you always misspell?',
		'What naps are the most satisfying?',
		'What’s the weirdest thing you’ve found lying on the ground / side of the road?',
		'What’s the funniest TV show you’ve ever seen?',
		'What’s the most embarrassing story from your childhood?',
		'What animal is the most majestic?',
		'What’s something that everyone knows is true, but we don’t like to admit it?',
		'What’s the weirdest text or email you’ve gotten?',
		'What always cheers you up when you think about it?',
		'What sport could you play the longest in a televised game, without anyone discovering you aren’t a professional athlete?',
		'If you could talk to animals and they would understand you, but you couldn’t understand them, what would you do with that power?',
		'What’s the most boring sport, and what would you do to make it more exciting?',
		'What’s the creepiest tech out there?',
		'Who did you use to look up to, but they screwed up and you lost faith in them?',
		'What’s fine in small numbers but terrifying in large numbers?',
		'Do you like things to be carefully planned or do you prefer to just go with the flow?',
		'What animal would you most like to eat?',
		'What fictional characters have you had a crush on over the years?',
		'What would the box with all your hopes and dreams inside look like?',
		'What was the worst shopping experience you’ve ever had?',
		'What story you’ve heard has stayed with you and always disturbs you every time you think about it?',
		'What was the most important appointment or deadline you missed?',
		'If you were a clown themed super hero, what powers would you have?',
		'If you could teleport anything you want, worth two million dollars or less, anywhere you want, what would you choose and where would you teleport it?',
		'If you lived in a virtual reality world of your own creation, what would it look like?',
		'What escalated very quickly?',
		'What two things are terrible when separate but great when you put them together?',
		'What did you believe for way too long as a child?',
		'What big event do you think will happen soon that most people aren’t expecting?',
		'What still makes you cringe when you think back on it?',
		'What current trend makes no sense to you?',
		'If you owned a restaurant, what kind of food would it serve?',
		'Which celebrity is the most likely to have a collection of canes that are just for show?',
		'What’s the weirdest crush you’ve had?',
		'What do a lot of people have very strong opinions about, even though they know very little about it?',
		'What’s your go to casino game?',
		'An epic feast is held in your honor, what’s on the table?',
		'What’s your favorite holiday movie?',
		'Who is the most manipulative person you’ve ever met?',
		'Who is the most creative person you know?',
		'What’s the funniest pick up line you’ve heard?',
		'What seemingly innocent question makes you think “It’s a trap!”?',
		'How ambitious are you?',
		'What did you like / dislike about where you grew up?',
		'What elements of pop culture will be forever tied in your mind to your childhood?',
		'What’s your good luck charm?',
		'What’s legal now, but probably won’t be in 25 years?',
		'Would you want the ability to hear the thoughts of people near you if you couldn’t turn the ability off?',
		'When was the last time you stayed up through the entire night?',
		'What’s something that people think makes them look cool, but actually has the opposite effect?',
		'What’s the oldest thing you own?',
		'What has someone borrowed but never given back?',
		'Where is the best place you’ve been for taking walks?',
		'If cartoon physics suddenly replaced real physics, what are some things you would want to try?',
		'What from the present will withstand the test of time?',
		'Who in your life is the worst at using technology?',
		'What’s the weirdest conversation you’ve eavesdropped on?',
		'What just around the corner tech are you eager to get your hands on?',
		'What was the darkest movie you’ve ever seen?',
		'What do you do when you hear something fall in the middle of the night while you are in bed?',
		'What outfit could you put together from clothes you own to get the most laughs?',
		'What’s the most disgusting sounding word in the English language?',
		'What was ruined because it became popular?',
		'What outdated slang do you use on a regular basis?',
		'What was the biggest realization you had about yourself?',
		'What’s your best example of easy come, easy go?',
		'What small change greatly improves a person’s appearance?',
		'What topic could you spend hours talking about?',
		'What happens regularly that would horrify a person from 100 years ago?',
		'What do a lot of people hope will happen but is just not going to happen?',
		'What’s the weirdest thing that has happened to you while working at your job?',
		'What questions would you like to ask a time traveler from 200 years in the future?',
		'Which way should toilet paper hang, over or under?',
		'What’s the most physically painful thing you’ve ever experienced?',
		'What horror story do you have from a job you’ve had?',
		'What’s the most rage inducing game you’ve ever played?',
		'What’s the biggest overreaction you’ve ever seen?',
		'What are some of the most common misconceptions?',
		'What job doesn’t exist now but will exist in the future?',
		'What awful movie do you love?',
		'What normally delicious food gets ruined when you wrap it in a tortilla?',
		'What’s your best example of fake it till you make it?',
		'What were you completely certain of until you found out you were wrong?',
		'What’s something commonly done that gets progressively weirder the more you think about it?',
		'What’s the cutest thing you can imagine? Something so cute it’s almost painful.',
		'If you were given unlimited resources, how would you lure the worst of humanity into one stadium at the same time?',
		'What do you think about when you hear the word “classy”?',
		'What near future predictions do you have?',
		'What do you need help with most often?',
		'What piece of “art” would you create if you had to pretend to be an artist and submit something to a gallery?',
		'What do you do to make the world a better place?',
		'What’s the best and worst thing about the country you are from?',
		'If you were in charge renaming things so that their names would be more accurate, what names would you come up with?',
		'What’s better broken than whole?',
		'What values are most important to you?',
		'What’s the best sandwich you’ve ever had?',
		'What’s the worst thing you ate from a fast food restaurant?',
		'What’s something that I don’t know?',
		'What profession doesn’t get enough credit or respect?',
		'What memory of yours feels real but is most likely false?',
		'What’s your “and then it got worse” story?',
		'What was the most amazing physical feat you’ve managed to pull off?',
		'What’s the most annoying thing about the social media platform you use most often?',
		'If you were hired to show tourists what life is really like where you live, what would you show them / have them do?',
		'What would be the most unsettling thing to keep occasionally finding around your house?',
		'What nicknames do you have for people in your life?',
		'What does the opposite sex do that you wish that you could do, but it’s not anatomically feasible or it’s socially frowned upon?',
		'How much do you plan / prepare for the future?',
		'What do you hate most and love most about your car / bike if you own one?',
		'What weird potato chip flavor that doesn’t exist would you like to try?',
		'What’s the silliest thing you’ve convinced someone of?',
		'How much do you think names affect the outcomes of people’s lives?',
		'What product or service is way more expensive than it needs to be?',
		'What’s the shadiest thing you’ve seen someone do?',
		'What was the last situation where some weird stuff went down and everyone acted like it was normal, and you weren’t sure if you were crazy or everyone around you was crazy?',
		'What did you eat so much of that now you hate it?',
		'What are some of the dumbest lyrics you’ve heard in a song?',
		'Where’s the line between soup and cereal?',
		'What word do you always mispronounce?',
		'What do you think you do better than 90% of people?',
		'What would be the worst food to be liquefied and drunk through a straw?',
		'What’s the weirdest thing about modern life that people just accept as normal?',
		'How much of your body would you cybernetically enhance if you could?',
		'If you wanted to slowly drive a roommate insane using only notes, what kind of notes would you leave around the house?',
		'If you had a giraffe that you needed to hide, where would you hide it?',
		'What’s the clumsiest thing you’ve done?',
		'What songs do you only know the chorus to?',
		'Think of a brand, now what would an honest slogan for that brand be?',
		'What’s something common from your childhood that will seem strange to future generations?',
		'What’s the most amazing place in nature you’ve been?',
		'What’s quickly becoming obsolete?',
		'Where is the most uncomfortable place you have ever slept?',
		'What’s the most annoying animal you’ve encountered?',
		'What’s your best example of correlation not equaling causation?',
		'In what situations, do you wish you could throw down a smoke bomb and disappear?',
		'When was the last time you were hopelessly lost?',
		'What songs do you feel compelled to sing along with when you hear them, even if you don’t totally know all the words?',
		'What product do you wish a company would make a “smart” version of?',
		'What two films would you like to combine into one?',
		'What’s are some of your Pavlovian responses?',
		'Would you rather AI and scientists oversee a country’s policies or politicians?',
		'If you could put a new idiom into common usage, what would it be?',
		'Do you prefer book or movies with happy endings or more dramatic endings and why?',
		'Who is your favorite artist or what is your favorite art style?',
		'What are some of the most interesting facts about the natural world you know?',
		'Do you think that wanting things necessarily leads to more sadness and misery?',
		'What famous person is actually making the world a better place?',
		'What are you waiting for?',
		'What do you look for when you buy clothes? (Good value, latest fashion, your own unique style, function, comfort, etc.)',
		'What is the strangest room or building you’ve been in?',
		'What choice would you make in a prisoner’s dilemma with a total stranger? How about with a friend or family member? *',
		'How much time do you spend on your phone?',
		'What sports if any do you like to watch? If you aren’t into traditional sports, weird and uncommon sports count too.',
		'What do you do when you feel like you are in a rut?',
		'How often did you climb trees as a child? Did you have a tree house or fort? When was the last time you climbed a tree?',
		'How do you think countries could allocate their resources better?',
		'What do you do to relax and let off steam?',
		'What is the craziest thing you’ve done this week?',
		'How much do you recycle?',
		'What are some weird ice cream flavors you’ve seen or heard of, would you try them?',
		'What was something you really wanted as a kid but now look back on and shake your head? (For me it was wanting to live in a water tower, or an inflatable giant soda can.)',
		'What is the perfect room temperature?',
		'What is your ideal home aesthetic if money wasn’t an issue?',
		'What are some pieces of art that had a big impact on you?',
		'What features would you like to see in the next round of TV’s?',
		'Do you prefer to be too hot or too cold, and why?',
		'How would you like to see the education system change?',
		'How self-motivated are you?',
		'What job are you grossly under qualified for but think you would be pretty good at?',
		'What’s the most exotic food you’ve ever eaten?',
		'What are the three most important life lessons you’ve learned?',
		'How much of an accent do you think you have? Are you proud of it or do you wish you could lose it for a more neutral accent?',
		'Who is the most hardcore person you know?',
		'Do you like cooking? What dishes can you make?',
		'What’s the best concert you’ve been to? What made it so good?',
		'What is the strangest sport you’ve heard of?',
		'Why do you think in western society it has been relatively uncommon for men to wear make up?',
		'If you could rename your country or state, what would you rename it and why?',
		'What trend do you think is on the way out?',
		'Where is the most enchanting place you’ve been?',
		'What’s your favorite way to spend a rainy day?',
		'What’s your perfect night out look like?',
		'Which of your possessions are so precious that if you dropped it in a public toilet you would reach in and grab it?',
		'When you fidget, what do you do?',
		'What was the last book you read?',
		'Do you think people are wiser now than they were 100 years ago? Why or why not?',
		'How comfortable are you being without a phone?',
		'In general, is it better for a person to stand out and be different or blend in with everyone else?',
		'Do you think silence is relaxing or unnerving? Why do you think other people might feel the opposite way?',
		'Do you think you are good leader or would make a good leader? Why or why not?',
		'How much do you trust or distrust authority figures?',
		'Have you ever or would you ever try cosplay?',
		'What is your dream vacation?',
		'What about modern society baffles you?',
		'How do you think the internet would change if all advertising was banned on the internet?',
		'What makes your hometown special?',
		'What is or was your most treasured clothing item?',
		'What is the best museum or strangest museum you have been to?',
		'How much sleep do you usually get?',
		'What’s the last movie you watched?',
		'What do you like and dislike about your city or town?',
		'What is the spiciest thing you’ve ever eaten?',
		'What is your favorite movie that came out in the last year?',
		'What do you pretend to understand but actually have no clue about?',
		'What are some red flags and green flags for a new friendship?',
		'How long would you choose to live given the choice of any number of years?',
		'How much faith do you put in humanity?',
		'What feels like a lifetime ago but was relatively recent?',
		'What is a memorable mess you had to clean up?',
		'What do you think the people in charge at your job or school could be doing better?',
		'Have you found your place in the world? How common or uncommon do you think it is to feel like you’ve found your place in the world?',
		'What three “tribes” do you feel closest to?',
		'If you were a spice, what spice would you be?',
		'How do you feel about snakes and spiders?',
		'How adventurous are you when it comes to food?',
		'What appliance would you have the hardest time doing without?',
		'How forgiving are you?',
		'What routine are you sick of but haven’t gotten around to changing it?',
		'How much of a role do you think A.I. will play in the near future?',
		'What were some of your favorite toys as a child?',
		'What do you think about reality TV shows?',
		'How well do you dance? What are some of your go to moves?',
		'Do you buy designer clothes, avoid them, or simply go by style / price? Why?',
		'How good are you at admitting when you are wrong?',
		'Who’s is the person you feel most comfortable around?',
		'How well do you handle spicy food?',
		'Do you think that humans as a species have changed much in the last 2000 years? Not human technology but humans themselves. Why or why not?',
		'Are you a patient person? What are you patient with that most people aren’t and what do you have no patience for?',
		'What is something that unnerves you but the majority people don’t seem to be bothered by?',
		'How well do you take criticism?',
		'What is the best part of this period your life? What do you think you’ll be nostalgic for?',
		'What is the best thing going on in your life at the moment?',
		'Do you think some adversity is good for a person? How much is too much?',
		'What part of the house do you hate to clean the most?',
		'What famous person are you a little too obsessed with?',
		'How do you think you’d fair in prison?',
		'What innovative idea or product have you heard about recently?',
		'Where do you draw your inner strength?',
		'Are relationships with your friends or your family more important to you?',
		'How good is your sense of direction? How often do you get lost?',
		'What is the strangest or most interesting creature you have heard of?',
		'What is the single most important thing a single individual can do to further the greater good?',
		'Do you have a green thumb or hands of death when it comes to plants? What roughly is your kill / grow ratio?',
		'What unhealthy snack can you not get enough of?',
		'What do you think of the electric scooters you find in most big cities?',
		'What are some of your favorite memories with your family?',
		'What do you think the next big tech thing will be?',
		'How much do you take care of your health?',
		'What do you know the most about?',
		'Have you ever or would you ever dye your hair a wild color?',
		'How big of a part of success does luck play?',
		'What is something you covet?',
		'What are some of your happiest childhood memories?',
		'How judgmental are you?',
		'What’s your favorite store or type of store to walk around in? How about your least favorite?',
		'When are you at your happiest?',
		'Most cultures have some form of dance, what benefit do you think dancing gave to early humans?',
		'What new language would you like to learn most?',
		'What is your favorite accessory?',
		'What kind of people do you surround yourself with?',
		'What was one experience that you were hesitant to try but are really glad you did?',
		'What song or artist are you into at the moment?',
		'What’s your favorite type of funny video to watch?',
		'Which drugs, if any, do you think should be legalized and why?',
		'When was the last time you went camping?',
		'What are the three biggest threats facing the world?',
		'What is worth standing in line for?',
		'What is the best way to spend a day alone?',
		'What is the best complement you’ve ever received?',
		'If you were a graffiti artist what would your tag look like?',
		'What were some of the non-tragic turning points in your life?',
		'What scene from a movie still haunts you?',
		'What’s your favorite TV show currently on air?',
		'Where is your favorite place to take a walk?',
		'What songs do you know every word to?',
		'What are some of your favorite things to do outside?',
		'What was your favorite class in school?',
		'Do you prefer dogs or cats or another animal perhaps?',
		'Do you like movie theater popcorn with butter or without?',
		'Are you a morning person or a night person?',
		'What is your favorite animated film?',
		'Is there a country you’ve really been wanting to visit?',
		'What makes you happy?',
		'What made you laugh recently?',
		'Do you play video games? If so, what type of video games do you play the most? If not, why not?',
		'Which do you prefer, shopping online or in person?',
		'What are a couple of your favorite quotes?',
		'Would you rather take a walk through a forest or along a beach?',
		'What do you probably spend too much money or time on but it is totally worth it?',
		'What are you a stickler for?',
	];

	constructor(
		private _prisma: PrismaService,
		private _client: Client
	) {}

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
		const latestLog = await this._prisma.qotDLog.findFirst({
			where: {
				guildId,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		if (latestLog) {
			index = latestLog.index + 1;
		}

		if (index >= this.questions.length - 1) {
			index = 0;
		}

		await this._prisma.qotDLog.create({
			data: {
				guildId,
				index,
			},
		});

		return this.questions[index];
	}

	@Cron('0 21 * * * *')
	async checkDaily() {
		this._logger.log('Checking for qotd daily question.');

		const hour = getHours(new Date());
		const settings = await this._prisma.settings.findMany({
			where: {
				qotdDailyHour: hour,
				qotdChannelId: {
					not: null,
				},
				qotdEnabled: true,
				qotdDailyEnabled: true,
			},
		});

		for (const {
			guildId,
			qotdDailyChannelId,
			qotdPingRoleId,
		} of settings) {
			if (!qotdDailyChannelId) {
				continue;
			}

			const guild = await this._client.guilds.fetch(guildId);
			const channel = await guild.channels.fetch(qotdDailyChannelId);
			const question = await this.get(false, guildId);

			if (!question) {
				continue;
			}

			if (channel?.type === ChannelType.GuildText) {
				const embed = createQuestionEmbed(
					`${MESSAGE_PREFIX} Daily question of the day`,
					question,
					this._client.user
				);
				const content = qotdPingRoleId ? `<@&${qotdPingRoleId}>` : '';
				await channel.send({ embeds: [embed], content });
			}
		}
	}
}
