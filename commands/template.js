module.exports = {
	name: '',
	aliases: [],
	description: '',
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('./../tools.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
			if (err) console.error(err)
		});
	},
};