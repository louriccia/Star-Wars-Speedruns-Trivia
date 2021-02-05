module.exports = {
	name: 'ready',
	aliases: ['unready'],
	description: 'readies/unreadies a player',
	stage: ['pregame'],
	hostonly: false,
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('./../tools.js');
		let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
		var ready = "ready"
		if(message.content == ".unready") {
			ready = "unready"
		}
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		if(trivia_game.status == "pregame"){
			if(trivia_game.players[message.author.id] == undefined){
				var data = {
					name: message.author.username,
					status: ready,
					responses: [],
					score: 0
				}
				trivia_game.players[message.author.id] = data
				let role = message.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
				if(role !== undefined){
					message.member.roles.add(role.id).catch(error=>console.log(error))
				}
			}
			trivia_game.players[message.author.id].status = ready
			fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
				if (err) console.error(err)
			});
			tools.triviaEmbed(client, message, trivia_game)
			message.delete()
		} else {
			message.channel.send("Sorry, there is no game available to join").then(msg => {
				msg.delete({ timeout: 3000, reason: 'bot cleanup'})
				message.delete({ timeout: 3000, reason: 'bot cleanup'})
			})
			.catch()
		}
	},
};