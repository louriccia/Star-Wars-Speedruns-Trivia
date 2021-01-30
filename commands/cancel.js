module.exports = {
	name: 'cancel',
	aliases: [],
	description: "cancels a game before it's started",
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('./../tools.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		if(trivia_game.hostid == message.author.id && trivia_game.status == "pregame"){
			trivia_game.status = "canceled";
			fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
				if (err) console.error(err)
			});
		}
	},
};