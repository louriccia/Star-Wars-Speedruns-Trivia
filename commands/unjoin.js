module.exports = {
    name: 'unjoin',
    aliases: ['leave'],
    description: '',
    execute(message, args, client) {
      const fs = require('fs');
      const Discord = require('discord.js');
      var tools = require('./../tools.js');
      let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
      let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
      if(trivia_game.players !== undefined && trivia_game.status == "pregame"){
        if(trivia_game.players[message.author.id] !== undefined){
          delete trivia_game.players[message.author.id]
          fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
            if (err) console.error(err)
          });
          tools.triviaEmbed(client, message, trivia_game)
          let role = message.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
          if(role !== undefined){
            message.member.roles.remove(role.id).catch(error=>console.log(error))
          }
        }
      }
      message.delete()
	},
};
