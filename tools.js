module.exports = {
    triviaEmbed: function(client, message, gamefile){
        const fs = require('fs');
		const Discord = require('discord.js');
        const gameEmbed = new Discord.MessageEmbed()
        var playerList = ""
        var players = gamefile.players
        var ready = 0
        var keys = Object.keys(players)
        for(i=0; i<keys.length; i++){
            var k = keys[i];
            if(players[k].ready){
                playerList = playerList + "\n:green_circle:  " + players[k].name
                ready ++
            } else if (!players[k].ready) {
                playerList = playerList + "\n:o:  " + players[k].name
            }
        }
        gameEmbed
            .setAuthor(gamefile.hostname + " is hosting a trivia game!", client.guilds.resolve(message.guild.id).members.resolve(gamefile.hostid).user.avatarURL())
            .setTitle(gamefile.name)
            .setDescription("type `.trivia` to repost this message")
            .addField("How to Play", "**Pre-Game**" +
            "\ntype `.join` to join the game" +
            "\ntype `.ready` when you're ready to play" +
            "\ntype `.unjoin` / `.unready` to leave the game or unready" +
            "\n**In-Game**" +
            "\nas questions appear, type the letter for the correct answer" +
            "\ntype `.forfeit` or `.quit` to quit the game" +
            "\ntype `.scores` to see the current scores for all players" +
            "\n**Host Only**" +
            "\ntype `.cancel` to cancel this game" +
            "\ntype `.start` to start the game" +
            "\ntype `.next` for the next question" +
            "\ntype `.done` to end the game")
        if(playerList !== ""){
            gameEmbed.addField("Players (" + ready + "/" + Object.keys(players).length + " Ready)", playerList)
        }
        try{
            message.channel.messages.fetch(gamefile.message)
            .then(msg => {
                msg.edit(gameEmbed).catch(err=> console.log("game message was deleted"))
            
            }).catch(err=> console.log("game message was deleted"));
        } catch{console.log("no message found")}
        
        return gameEmbed
    }
}