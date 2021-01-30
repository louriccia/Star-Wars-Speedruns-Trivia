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
                    players: {}
                  }
                  fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => { //initialize game file
                    if (err) console.error(err)
                  });
                  fs.writeFile("trivia_questions.json", JSON.stringify(questions), (err) => { //get questions for current game
                    if (err) console.error(err)
                  });
                  message.channel.send(tools.triviaEmbed(client, message, trivia_game))
                } else {
                  message.channel.send("It appears " + trivia_game.hostname + " is already hosting a game called " + trivia_game.name + ".\nIf the game has ended, the host must use the `.done` command")
                }
    
              } else {
                message.channel.send('Sorry, this channel is not registered for trivia games.')
              }
              
            } else {
              message.channel.send(':exclamation: Please include the title of the new game: `.trivia new "your game title here"`')
            }
          } else if(args[0] == "info"){ //get total scores for all players
  
          }
        } else {
          //message.channel.send('Start a new game using the `.trivia new "game title"` command or view a list of scores using `.trivia info`')
          let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
          message.channel.messages.fetch(trivia_game.message)
            .then(msg => {
                msg.delete().catch(err=> console.log(err))
            
            }).catch(err=> console.log(err));
          message.channel.send(tools.triviaEmbed(client, message, trivia_game)).then(msg => {
            trivia_game.message = msg.id
                    fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => { //initialize game file
                      if (err) console.error(err)
                    });
          })
        }
        

        /*
        questionEmbed.setTitle(questions[randomquestion].question)
          .addFields([
            {
              name: ":regional_indicator_a:   " + questions[randomquestion]["A"],
              value: '\u200B'
            }, {
              name: ":regional_indicator_b:   " + questions[randomquestion]["B"],
              value: '\u200B'
            }, {
              name: ":regional_indicator_c:   " + questions[randomquestion]["C"],
              value: '\u200B'
            }, {
              name: ":regional_indicator_d:   " + questions[randomquestion]["D"],
              value: '\u200B'
            }])
        message.channel.send(questionEmbed);
        fs.writeFile("trivia_question.txt", questions[randomquestion].question + "\n    A: " + questions[randomquestion]["A"] + "\n    B: " + questions[randomquestion]["B"] + "\n    C: " + questions[randomquestion]["C"] + "\n    D: " + questions[randomquestion]["D"], function (err) {
            if (err) return console.log(err);
          })
        */
	},
};