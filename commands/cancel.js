module.exports = {
	name: 'cancel',
	aliases: [],
	stage: ['pregame','ingame'],
	description: "cancels a game before it's started",
	hostonly: true,
	execute(message, args, client) {
		const fs = require('fs');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));

		message.channel.send("The game `" + trivia_game.name + "` has been canceled by the host")
		//delete game message
		message.channel.messages.fetch(trivia_game.message).then(msg => {msg.delete()}).catch(err=> console.log(err));
		//remove trivia role
		var players = trivia_game.players
		var keys = Object.keys(players)
		for(i=0; i<keys.length; i++){ 
			var k = keys[i];
			let role = message.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
			if(role !== undefined){
				message.guild.members.cache.get(k).roles.remove(role.id).catch(error=>console.log(error))
			}
		}
		//reset game file
		trivia_game = {}
		fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
			if (err) console.error(err)
		});
	},
};