module.exports = {
    triviaEmbed: function(client, message, gamefile){
        const fs = require('fs');
        let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
		const Discord = require('discord.js');
        const gameEmbed = new Discord.MessageEmbed()
        var playerList = ""
        var players = gamefile.players
        var ready = 0
        if(players !== undefined){
            var keys = Object.keys(players)
            for(i=0; i<keys.length; i++){
                var k = keys[i];
                if(gamefile.status == "pregame"){
                    if(players[k].status == "ready"){
                        playerList = playerList + "\n:green_circle:  " + players[k].name
                        ready ++
                    } else if (players[k].status == "unready") {
                        playerList = playerList + "\n:o:  " + players[k].name
                    }
                } else {
                    playerList = playerList + players[k].name
                }
                
            }
        }
        var pregame = ["", ""]
        if(gamefile.status == "pregame"){
            pregame = ["click :green_circle: / :o: to join this game as ready / unready", "`.cat all/none/#` to select question categories" +
            "\n`.start` or click :arrow_forward: to start the game"]
        }
        gameEmbed
            .setAuthor(gamefile.hostname + " is hosting a trivia game!", client.guilds.resolve(message.guild.id).members.resolve(gamefile.hostid).user.avatarURL())
            .setTitle(gamefile.name)
            .setColor("3B88C3")
            .addField("How to Play", pregame[0] +
            "\nas questions appear, type the letter for the correct answer" +
            "\n`.scores` to see the current total scores for each player")
            .addField("Host Commands",
            pregame[1] +
            "\n`.cancel` to cancel the game without saving" +
            "\n`.next` or click :arrow_forward: for the next question" +
            "\n`.done` to save and end the game and post final results")
        var cat = ""
        var count = 0
        if(gamefile.status == "pregame"){
            for(i=0; i<gamefile.categories.length; i++){
                if(gamefile.categories[i].selected){
                    count += gamefile.categories[i].count
                    cat += ":white_check_mark:  " + (i+1) + ". " + gamefile.categories[i].name + " `(" + gamefile.categories[i].count + ")`\n"
                } else {
                    cat += ":black_large_square:  " + (i+1) + ". "  + gamefile.categories[i].name+ " `(" + gamefile.categories[i].count + ")`\n"
                }
            }
        } else {
            for(i=0; i<gamefile.categories.length; i++){
                if(gamefile.categories[i].selected){
                    cat += gamefile.categories[i].name + "\n"
                    count += gamefile.categories[i].count
                }
            }
        }
        
        gameEmbed.addField("Categories (" + count + " Questions)", cat, true)
        if(gamefile.status == "pregame"){
            gameEmbed.addField("Players (" + ready + "/" + Object.keys(players).length + " Ready)", playerList + '\u200B', true)
        } else {
            gameEmbed.addField("Players (" + Object.keys(players).length + ")", playerList + '\u200B', true)
        }
        var hostnotify = ""
        if(ready>=trivia_config.min_players && ready == Object.keys(players).length && gamefile.status == "pregame"){
            hostnotify = "<@" + gamefile.hostid + "> all joined players ready"
            gameEmbed.setColor("FAA61A")
        }
        try{
            message.channel.messages.fetch(gamefile.message)
            .then(msg => {
                msg.edit(hostnotify, gameEmbed).catch(err=> err)
            
            }).catch(err=> err);
        } catch{console.log("no message found")}
        
        return gameEmbed
    }
}