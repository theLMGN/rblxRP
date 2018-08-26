 var ps = require('ps-node');
 var DiscordRPC = require("discord-rpc")
 var snek = require("snekfetch")
 var rpc = new DiscordRPC.Client({ transport: 'ipc' });
 var isPlaying = false
 var placeId = 0
 var leader = false
 var inParty = false
 var gameCache = {
    606849621: {
        hasIcon: true,
        name: "Jailbreak",
    },
    192800: {
        hasIcon: true,
        name: "Work At A Pizza Place"
    },
    142823291: {
        hasIcon: true,
        name: "Murder Mystery 2"
    },
    292439477: {
        hasIcon: true,
        name: "Phantom Forces"
    },
    2098516465: {
        hasIcon: true,
        name: "Roblox High School 2"
    },
    189707: {
        hasIcon: true,
        name: "Natural Disaster Survival"
    }
 }
 var loggedIn = false
 function scan() {
    ps.lookup({}, function(err, resultList ) {
        
         if (err) {
             throw new Error( err );
         }
         isPlaying = false
         for (var process of resultList) {
             if (process.command.toLowerCase().includes("roblox")) {
                console.log( 'Found an instance of Roblox running' );[]
                for (var arg of process.arguments) {
                    if (arg.startsWith("https://assetgame.roblox.com")) {
                        console.log("Found the arguments")
                        isPlaying = true
                        placeId = new URL(arg).searchParams.get("placeId")
                        leader = new URL(arg).searchParams.get("isPartyLeader")
                        inParty = new URL(arg).searchParams.get("isPlayTogetherGame")
                        if (!gameCache[new Number(placeId)]) {
                            snek.get(`https://api.roblox.com/marketplace/productinfo?assetId=${placeId}`).then(r => gameCache[new Number(placeId)] = {hasIcon: false, name: r.body.Name});
                            console.log(gameCache)
                        }
                    }
                }
             }
            
         }
     });
    
 }
scan()
 setInterval(scan,1000)




function thing() {
    var partyStatus = `Not in a party`
    console.log("Updating presense on Discord",inParty,leader)
    if (inParty == true) {
        partyStatus = `Playing in a party`
    }
    if (leader == true) {
        partyStatus = `Leading a party`
    }
    var icon = `roblox`
    if (gameCache[new Number(placeId)].hasIcon) {
        icon = placeId
    }
    rpc.setActivity({
        details: gameCache[new Number(placeId)].name,
        state: partyStatus,
        largeImageKey: icon,
        largeImageText: `http://roblox.com/games/${placeId}`,
        smallImageKey: 'roblox',
        smallImageText: `rblxRP by theLMGN`,
        instance: false,
    });
}

 rpc.on('ready', async () => {
    loggedIn = true
    thing()
})

 async function setActivity() {

    if (isPlaying) { 
        if (!loggedIn) {
            rpc.login({clientId: "483050415487713285"}).catch(console.error);
        } else {
            thing()
        }
        
    } else {
        
        if (loggedIn == true) {
            rpc.transport.close()
            loggedIn = false
        }
        console.log("Not playing ROBLOX")
        
    }

}

setActivity();

// activity can only be set every 15 seconds
setInterval(() => {
    setActivity();
}, 15000);