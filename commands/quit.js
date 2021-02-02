module.exports = {
	name: 'quit',
	aliases: ['forfeit'],
	description: "cancels a game before it's started",
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('./../tools.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		if(trivia_game.players[message.author.id] !== undefined){
			message.channel.send(message.author.username + " has quit the game").then(msg => {
				msg.delete({ timeout: 3000, reason: 'bot cleanup'})
				message.delete({ timeout: 3000, reason: 'bot cleanup'})
			})
			.catch()
			tools.triviaEmbed(client, message, trivia_game)
			trivia_game.players[message.author.id].status = "forfeit"
			let role = message.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
			if(role !== undefined){
				message.member.roles.remove(role.id).catch(error=>console.log(error))
			}
		}
		fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
			if (err) console.error(err)
		});

	},
};