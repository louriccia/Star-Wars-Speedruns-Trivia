module.exports = {
	name: 'start',
	aliases: [],
	description: 'starts the game',
	stage: ['pregame'],
	hostonly: true,
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('./../tools.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
		let trivia_questions = JSON.parse(fs.readFileSync("trivia_questions.json", "utf8"));
		var players = trivia_game.players
        var unready = []
		if(players !== undefined){
			var keys = Object.keys(players)
			if(trivia_game.status == "pregame"){
				if(message.author.id == trivia_game.hostid){
					for(i=0; i<keys.length; i++){
						var k = keys[i];
						if(players[k].status == "unready"){
							unready.push(players[k].name)
						}
					}
					if(unready.length > 0 && !(args[0] == "-f" && (message.member.roles.cache.some(role => trivia_config.roles.bot_commander == role.name) || message.member.hasPermission(['ADMINISTRATOR', 'MANAGE_GUILD'])))){
						message.channel.send("Not all players readied. The folowing players have not used the `.ready` command: \n" + unready.join(", "))
					} else if(Object.keys(players).length < trivia_config.min_players){
						message.channel.send("Unable to start game. Not enough players have joined.")
					} else if(trivia_questions.questions.length < 1){
						message.channel.send("Unable to start game. No question categories selected.")
					} else { //start game
						for(i=0; i<keys.length; i++){
							var k = keys[i];
							players[k].status = "playing"
						}
						trivia_game.status = "ingame"
						trivia_game.num_questions = 0
						fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
							if (err) console.error(err)
						});
						let role = message.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
						let triviarole = ""
						if(role !== undefined){
							triviarole = "<@&" + role.id + ">"
						}
						tools.triviaEmbed(client, message, trivia_game)
						message.channel.send( triviarole + " The host has started the game. Get ready for the first question in 10 seconds!") //ping the players in this message
						setTimeout(function(){ 
							message.channel.send("5...")
						}, 5000);
						setTimeout(function(){ 
							message.channel.send("4...")
						}, 6000);
						setTimeout(function(){ 
							message.channel.send("3...")
						}, 7000);
						setTimeout(function(){ 
							message.channel.send("2...")
						}, 8000);
						setTimeout(function(){ 
							message.channel.send("1...")
						}, 9000);
						setTimeout(function(){ 
							client.commands.get('next').execute(message, args, client);
						}, 10000);
					}
				} else {
					message.channel.send("Only the host can start the game.")
				}
			} else {
				message.channel.send("Game already in progress. The host must use `.next` to get the next question.")
			}
			
		} else {
			message.channel.send("No game to start. Use the `.trivia new 'game name'` command to set up a new game.")
		}
	},
};