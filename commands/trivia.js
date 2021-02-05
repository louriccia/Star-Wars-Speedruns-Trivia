module.exports = {
  name: 'trivia',
  aliases: [],
  stage: ['pregame', 'ingame', 'finished', undefined],
  description: 'start a game or show a leaderboard',
  hostonly: true,
	execute(message, args, client) {
        const fs = require('fs');
        const Discord = require('discord.js');
        let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
        let questions = JSON.parse(fs.readFileSync("questions.json", "utf8"));
        var trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
        var tools = require('./../tools.js');
        var error = false
        if(args.length > 0){
          if(args[0] == "new"){ //new game
            if(args.length > 1){
              if(message.member.roles.cache.some(role => [trivia_config.roles.host_eligible,trivia_config.roles.bot_commander].includes(role.name)) || message.member.hasPermission(['ADMINISTRATOR', 'MANAGE_GUILD'])){
                if(["finished", undefined].includes(trivia_game.status)){
                  var gameName = args.slice(1).join(" ").replace(/\"/g, "") 
                  var categories = []
                  for(i=0; i<questions.questions.length; i++){
                    if(!categories.includes(questions.questions[i].category)){
                      categories.push(questions.questions[i].category)
                    }
                  }
                  categories.sort(function(a, b) {
                    var textA = a.toUpperCase();
                    var textB = b.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                  });
                  trivia_game = {
                    name: gameName,
                    hostname: message.author.username,
                    hostid: message.author.id,
                    channelid: message.channel.id,
                    date: message.createdAt,
                    status: "pregame",
                    players: {},
                    categories: [],
                    questions: []
                  }
                  for(i=0; i<categories.length; i++){
                    var count = 0
                    for(j=0; j<questions.questions.length; j++){
                      if(questions.questions[j].category == categories[i]){
                        count ++
                      }
                    }
                    var data = {
                      name: categories[i],
                      selected: true, 
                      count: count
                    }
                    trivia_game.categories.push(data)
                  }
                  fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => { //initialize game file
                    if (err) console.error(err)
                  });
                  fs.writeFile("trivia_questions.json", JSON.stringify(questions), (err) => { //get questions for current game
                    if (err) console.error(err)
                  });
                } else {
                  message.channel.send("It appears " + trivia_game.hostname + " is already hosting a game called " + trivia_game.name + ".\nBefore a new game can be created, this game must be canceled or finished by its host using the `.cancel` or `.done` command")
                  error = true
                }
              } else {
                message.channel.send("Sorry, you do not have permission to host a trivia game")
                error = true
              }              
            } else {
              message.channel.send('Please include the title of the new game: `.trivia new "your game title here"`')
              error = true
            }
          }
        } else if(trivia_game.status == undefined || trivia_game.status == "finished"){
          message.channel.send('No game in progress. Use `.trivia new "game name"` to start a new game')
          error = true
        }
        if(!error){
          message.channel.send(tools.triviaEmbed(client, message, trivia_game)).then(msg => {
            if(trivia_game.status == "pregame"){
              msg.react('🟢').then(msg.react('⭕')).then(msg.react('ℹ️')).then(msg.react('▶️')).then(async function (mes) {
                const filter = (reaction, user) => {
                  return (reaction.emoji.name == reaction.emoji.name);
                };   
                const collector = msg.createReactionCollector(filter, {})
                  collector.on('collect', (reaction, user) => {  
                    if(user.id !== '803797167617605652'){
                      if(reaction.emoji.name == '▶️' && user.id == trivia_game.hostid){
                        client.commands.get('start').execute(message, args, client);
                      } else if(reaction.emoji.name == 'ℹ️' && user.id !== '803797167617605652'){
                        client.commands.get('help').execute(message, args, client);
                      }
                      if(trivia_game.status == "pregame"){
                        if(['⭕', '🟢'].includes(reaction.emoji.name)){
                          var ready = "ready"
                          if(reaction.emoji.name == '⭕'){
                            ready = "unready"
                          }
                          if(trivia_game.players[user.id] == undefined){
                            var data = {
                              name: user.username,
                              status: ready,
                              responses: [],
                              score: 0
                            }
                            trivia_game.players[user.id] = data
                            let role = msg.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
                            if(role !== undefined){
                              msg.guild.members.cache.get(user.id).roles.add(role.id).catch(error=>console.log(error))
                            }
                          }
                        trivia_game.players[message.author.id].status = ready
                        fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
                          if (err) console.error(err)
                        });
                        tools.triviaEmbed(client, message, trivia_game)
                        }
                      msg.reactions.resolve(reaction).users.remove(user.id);
                      }
                    }
                  })
              })
            } else {
              msg.react('ℹ️').then(msg.react('▶️')).then(async function (mes) {
                const filter = (reaction, user) => {
                  return (reaction.emoji.name == reaction.emoji.name);
                };   
                const collector = msg.createReactionCollector(filter, {})
                  collector.on('collect', (reaction, user) => {  
                    if(user.id !== '803797167617605652'){
                      if(reaction.emoji.name == '▶️' && user.id == trivia_game.hostid){
                        client.commands.get('next').execute(message, args, client);
                      } else if(reaction.emoji.name == 'ℹ️' && user.id !== '803797167617605652'){
                        client.commands.get('help').execute(message, args, client);
                      }
                    }
                  })
                })
            }
            message.channel.messages.fetch(trivia_game.message) //delete old game message
              .then(msg => {msg.delete()}).catch(err=> console.log(err));
            trivia_game.message = msg.id
            fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => { //save new game message
              if (err) console.error(err)
            });
            })
        }
        
       
	},
};