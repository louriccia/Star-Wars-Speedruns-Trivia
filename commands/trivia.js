module.exports = {
  name: 'trivia',
  aliases: [],
	description: 'start a game or show a leaderboard',
	execute(message, args, client) {
        const fs = require('fs');
        const Discord = require('discord.js');
        const gameEmbed = new Discord.MessageEmbed()
        var tools = require('./../tools.js');
        if(args.length > 0){
          if(args[0] == "new"){ //new game
            if(args.length > 1){
              let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
              let questions = JSON.parse(fs.readFileSync("questions.json", "utf8"));
              let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
              if(message.member.roles.cache.some(role => [trivia_config.roles.host_eligible,trivia_config.roles.bot_commander].includes(role.name)) || message.member.hasPermission(['ADMINISTRATOR', 'MANAGE_GUILD'])){
                if(trivia_config.channelID == message.channel.id){
                  if(["finished", "canceled", undefined].includes(trivia_game.status)){
                    var gameName = args.slice(1).join(" ").replace(/\"/g, "") 
                    let trivia_game = {
                      name: gameName,
                      hostname: message.author.username,
                      hostid: message.author.id,
                      channelid: message.channel.id,
                      date: message.date,
                      status: "pregame",
                      players: {},
                      questions: []
                    }
                    fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => { //initialize game file
                      if (err) console.error(err)
                    });
                    fs.writeFile("trivia_questions.json", JSON.stringify(questions), (err) => { //get questions for current game
                      if (err) console.error(err)
                    });
                    message.channel.send(tools.triviaEmbed(client, message, trivia_game)).then(msg => {
                      trivia_game.message = msg.id
                        fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => { //save game message
                          if (err) console.error(err)
                        });
                    })
                  } else {
                    message.channel.send("It appears " + trivia_game.hostname + " is already hosting a game called " + trivia_game.name + ".\nBefore a new game can be created, this game must be canceled or finished by its host using the `.cancel` or `.done` command")
                  }
                } else {
                  message.channel.send('Sorry, this channel is not registered for trivia games.')
                }
              } else {
                message.channel.send("Sorry, you do not have permission to host a trivia game")
              }              
            } else {
              message.channel.send(':exclamation: Please include the title of the new game: `.trivia new "your game title here"`')
            }
          } else if(args[0] == "info"){ //get total scores for all players
  
          }
        } else {
          //message.channel.send('Start a new game using the `.trivia new "game title"` command or view a list of scores using `.trivia info`')
          let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
          if(![undefined, "finished"].includes(trivia_game.status)){
            message.channel.messages.fetch(trivia_game.message)
              .then(msg => {
                  msg.delete()
              
              }).catch(err=> console.log(err));
            message.channel.send(tools.triviaEmbed(client, message, trivia_game)).then(msg => {
              trivia_game.message = msg.id
                      fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => { //initialize game file
                        if (err) console.error(err)
                      });
            })
          } else {
            message.channel.send("There is no active game. To start a new game, use the `.trivia new 'game title'` command")
          }
          
        }
	},
};