let system = server.registerSystem(0, 0);

//https://github.com/Imrglop/-GCD-AntiCheat-ElementZero

let currentTick = 0;

let positions = new Object();

let config = {showHealthOnActionbar:0, maxAfkTimeInTicks:12000, maxFlyTime:300, maxAPPSExtent:30, maxTimesFlagged:5, maxreach:5.1, maxDPPSExtent:20}

let disconnect = {nuker:`§cYou have been kicked for Cheating-Nuker / Block Cheats. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.`, afk:`You have been idle for more than ${config.maxAfkTimeInTicks/60/20} minutes. §7§oDon't worry, you will not be banned or punished any further§r.`, reach:"§cYou have been kicked for Cheating/Reach. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.", fly:"§cYou have been kicked for Cheating/Fly. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.", spawnitem:"§cYou have been kicked for Cheating/Spawning Items. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.", macro:"§cYou have been kicked for Cheating/Killaura:AutoClicker. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators."}

system.initialize = function() {

}

let illegalItems = ["glowingobsidian", "end_portal","end_gateway","invisiblebedrock", "netherreactor", "barrier", "structure_block", "command_block", "structure_void", "underwater_torch", "lit_furnace", "reserved6"]


function say(text) {
    let cEventData = system.createEventData("minecraft:display_chat_event")
    cEventData.data.message = text
    system.broadcastEvent("minecraft:display_chat_event", cEventData)
}

function execute(command) {
    function commandCallBack(commandResults) {
    } 
    system.executeCommand(command, (commandResults) => commandCallBack(commandResults))
}

function broadcast(text) {
    execute(`tellraw @a[tag=GCDAdmin] {"rawtext":[{"text":"§r§6[GCD]§2 ${text}"}]}`)
}

system.listenForEvent("minecraft:entity_use_item", function(eventData) {
    for (var i=0; i<illegalItems.length; i++) {
        if (eventData.data.item_stack.item === "minecraft:"+illegalItems[i]) {
            var pos = system.getComponent(eventData.data.entity, "minecraft:position").data
            execute(`execute @p[x=${pos.x}, y=${pos.y}, z=${pos.z}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ clear @p`)
            execute(`execute @p[x=${pos.x}, y=${pos.y}, z=${pos.z}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ tell @a[tag=GCDAdmin] §r@s[r=10000] §eused an illegal item (minecraft:${illegalItems[i]}).§r`)
            execute(`execute @p[x=${pos.x}, y=${pos.y}, z=${pos.z}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ scoreboard players add @s timesflagged 1`)
            execute(`execute @p[x=${pos.x}, y=${pos.y}, z=${pos.z}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ kick @s ${disconnect.spawnitem}`)
        }
    }
})

// Anti Reach

system.listenForEvent("minecraft:player_destroyed_block", function(eventData) {
    let pos = system.getComponent(eventData.data.player, "minecraft:position").data;

    var blockpos = eventData.data.block_position;

    var unbreakable = ["invisiblebedrock","end_portal","end_gateway","barrier","bedrock","border_block","structure_block","structure_void","end_portal_frame"]

    for (var i = 0; i < unbreakable.length; i++) {
        if (eventData.data.block_identifier === "minecraft:"+unbreakable[i]) {
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ tell @a[tag=GCDAdmin] §r§6[GCD]§a@s[tag=!GCDAdmin] §cwas flagged for Survival Block Hacks, breaking §e${eventData.data.block_identifier}§c.`)
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ kill`)
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ scoreboard players add @s timesflagged 1`)
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ tellraw @s {"rawtext":[{"text":"§cYou have been flagged for Block Hacks / InstaBreak.§r"}]}`)
            execute(`setblock ${blockpos.x.toString()} ${blockpos.y.toString()} ${blockpos.z.toString()} ${eventData.data.block_identifier}`)
        }
    }

 
    let distX = (Math.abs(pos.x - blockpos.x))
    let distY = (Math.abs(pos.y - blockpos.y))
    let distZ = (Math.abs(pos.z - blockpos.z))

    let maxblockreach = 6

    // InfiniteBlockReach

    if (distX >= maxblockreach || distY >= maxblockreach || distZ >= maxblockreach) {
        execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ tell @a[tag=GCDAdmin] §r§6[GCD]§a @s[tag=!GCDAdmin] §cwas flagged for Survival Block Reach, reaching ${distX.toString()} x ${distY.toString()} y ${distZ.toString()} z blocks.`)
    }
    
    execute(`scoreboard players add @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] DPPS 1`)
    
});

system.listenForEvent("minecraft:player_attacked_entity", function(eventData) {

        var attacked = eventData.data.attacked_entity;

        var player = eventData.data.player;

        if (eventData.data.attacked_entity.__identifier__ === "minecraft:ender_dragon") { 
            // do not flag if it is an ender dragon
            return false;
        }

        if (system.getComponent(eventData.data.attacked_entity, "minecraft:health") === undefined || system.getComponent(eventData.data.player, "minecraft:health") === undefined) {return}

        if (system.getComponent(eventData.data.attacked_entity, "minecraft:position") === undefined || system.getComponent(eventData.data.player, "minecraft:position") === undefined) {return}

        let attackedpos = system.getComponent(eventData.data.attacked_entity, "minecraft:position").data;




        let attackerpos = system.getComponent(eventData.data.player, "minecraft:position").data;
		

        let attackerhealth = system.getComponent(eventData.data.player, "minecraft:health").data;
        
        if (system.getComponent(eventData.data.attacked_entity, "minecraft:health") === undefined) return;
		
        let attackedhealth = system.getComponent(eventData.data.attacked_entity, "minecraft:health").data;
		

        if (attackedpos != undefined) {
        let distX = (Math.abs(attackedpos.x - attackerpos.x))
        let distY = (Math.abs(attackedpos.y - attackerpos.y))
        let distZ = (Math.abs(attackedpos.z - attackerpos.z))

        var distall = (distX + distZ) / 1.5

        if (attackedhealth.value != undefined) {

            if (config.showHealthOnActionbar == 1) {

                execute(`title @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] actionbar §cHealth: ${(attackedhealth.value).toString()} / ${attackedhealth.max}`)

            }
        }
        function test(results) {

        }

        //execute(`title @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] actionbar reach: ${distX.toString()} ${distY.toString()} ${distZ.toString()}}`)


        if (distX >= config.maxreach || distZ >= config.maxreach || distall >= config.maxreach) {
            function commandCallBack(commandResults) {
                say(JSON.stringify(commandResults))
            } 
            var nameable = system.getComponent(player, "minecraft:nameable").data.name;
            // Patch to fix creative mode and admin flagging
            execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}"] ~ ~ ~ tell @a[tag=GCDAdmin] §r@s[r=10000] §cwas flagged for Reach hacks.§r`)
            execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}"] ~ ~ ~ tellraw @s {"rawtext":[{"text":"§cYou have been flagged for Cheating.§r"}]}`)
            execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}"] ~ ~ ~ scoreboard players add @s timesflagged 1`)
            execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}"] ~ ~ ~ kill @s`)

        }
    }

})

let clipBlocks = ["stone", "bedrock", "dirt", "grass", "quartz_block", "planks", "wood", "log"]

system.update = function() {

    if (currentTick === 0) {
        execute(`scoreboard objectives add GCD dummy GamingChairDebuff`)
        execute(`scoreboard objectives add flytime dummy FlightTime`)
        execute(`scoreboard players set flytime GCD 225`)
        execute(`scoreboard objectives add APPS dummy AttackPackets`)
        execute(`scoreboard players set afktime GCD 12000`)
        execute("scoreboard players add showhealth GCD 0")
        execute(`scoreboard objectives add timesflagged dummy TimesFlagged`)
        execute(`scoreboard players add maxtimesflagged GCD 0`)
        execute(`scoreboard objectives add DPPS dummy DestroyPackets`)
        execute(`scoreboard playres add nukerinterval GCD 0`)
    }
    
    for (var i = 0; i < clipBlocks.length; i++) {
        execute(`execute @e[tag=!GCDAdmin, type=player] ~ ~ ~ detect ~ ~ ~ ${clipBlocks[i]} -1 tell @a[tag=GCDAdmin] §r@s[r=1000] §eis possibly using No-Clip (Clipped through block §aminecraft:${clipBlocks[i]}).`)

        execute(`execute @e[tag=!GCDAdmin, type=player] ~ ~ ~ detect ~ ~ ~ ${clipBlocks[i]} -1 effect @s instant_damage 1 0 true`)

        execute(`execute @e[tag=!GCDAdmin, type=player] ~ ~ ~ detect ~ ~ ~ ${clipBlocks[i]} -1 spreadplayers ~ ~ 0 1 @s`)
    }

    // IMPORT SETTINGS
    
    execute(`scoreboard players add flytime GCD 0`)
    
    function cmdCallback(results) {
        // statusMessage
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))
        config.maxFlyTime = Number(subbed[1])
    }

    system.executeCommand("scoreboard players test flytime GCD -2147483648", (commandResults) => cmdCallback(commandResults))

    function setShowHealth(results) {
        // statusMessage
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))
        config.showHealthOnActionbar = Number(subbed[1])
    }

    system.executeCommand("scoreboard players test showhealth GCD -2147483648", (commandResults) => setShowHealth(commandResults))

    function maxTimesFlagged(results) {
        // statusMessage
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != undefined) {
        if (Number(subbed[1]) != 0) {
            config.maxTimesFlagged = Number(subbed[1])
        }
    }
    }
    

    system.executeCommand("scoreboard players test maxtimesflagged GCD -2147483648", (commandResults) => maxTimesFlagged(commandResults))

    function maxTimesFlagged(results) {
        // statusMessage
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != undefined) {
        if (Number(subbed[1]) > 1) {
            config.maxDPPSExtent = Number(subbed[1])
        }
    }
    }
    

    system.executeCommand("scoreboard players test nukerinterval GCD -2147483648", (commandResults) => maxTimesFlagged(commandResults))


    // FLYHACK

    execute(`execute @a[scores={flytime=${config.maxFlyTime}..}, tag=!GCDAdmin] ~ ~ ~ tell @a[tag=GCDAdmin] §e@s[tag=!GCDAdmin] was flagged for flight, therefore they are kicked.`)

    execute(`scoreboard players set @a[scores={flytime=${config.maxFlyTime}..}, tag=!GCDAdmin] flytime -333`)

    execute(`scoreboard players add @a[scores={flytime=-333}, tag=!GCDAdmin] timesflagged 1`)

    execute(`kick @a[scores={flytime=-333}, tag=!GCDAdmin] ${disconnect.fly}`)



    execute(`scoreboard players add @a timesflagged 0`)

    execute(`scoreboard players add @a flytime 0`)

    // AFKTIME - Disabled

    /*

    execute(`execute @a ~ ~ ~ execute @s[r=0.1] ~ ~ ~ scoreboard players add @s afktime 2`)

    execute(`tag @a remove notmoving`)

    execute(`execute @a ~ ~ ~ execute @s[r=0.1] ~ ~ ~ tag @s add notmoving`)

    execute(`scoreboard players remove @a afktime 1`)
    
    execute(`execute @a ~ ~ ~ execute @s[tag=!notmoving] ~ ~ ~ scoreboard players reset @s afktime`)

    execute(`execute @a[scores={afktime=${config.maxAfkTimeInTicks}..}] ~ ~ ~ scoreboard players set @s afktime -301`)

    execute(`kick @a[scores={afktime=-301}] ${disconnect.afk}`)

    */

    //

    if (currentTick % 20 === 0) {
        execute(`execute @a[scores={flytime=${Math.floor(config.maxFlyTime*0.35).toString()}..}] ~ ~ ~ execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 tell @a[tag=GCDAdmin] §6[GCD]§e @s[tag=!GCDAdmin]§c is possibly fly-hacking.§r`)
        execute(`execute @a[scores={flytime=${Math.floor(config.maxFlyTime*0.35).toString()}..}] ~ ~ ~ execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 effect @s instant_damage 1 0`)
        execute(`execute @a[scores={flytime=${Math.floor(config.maxFlyTime*0.35).toString()}..}] ~ ~ ~ execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 spreadplayers ~ ~ 0 1 @s`)
    }
1
    if (currentTick % 8 === 0) {

        execute(`scoreboard players remove @a[scores={flytime=1..}] flytime 1`)
    } else if (currentTick % 2 === 0) {
        execute(`scoreboard players remove @a[scores={APPS=1..}] APPS 1`)
    }
    // KILLAURA

    execute(`scoreboard objectives add GCDAge dummy`)

    execute(`scoreboard players add @e[name="gcd_912hj38ye789ryq78623y"] GCDAge 1`)

    execute(`scoreboard players add @a[scores={APPS=..-1}] APPS 1`)

    execute(`execute @a[scores={APPS=${config.maxAPPSExtent}..},tag=!GCDAdmin] ~ ~ ~ tell @a[tag=GCDAdmin] §r§e @s §cwas flagged for Killaura.§r`)
    
    execute(`scoreboard players set @a[scores={APPS=${config.maxAPPSExtent}..},tag=!GCDAdmin] APPS -5`)

    execute(`scoreboard players add @a[scores={APPS=-5},tag=!GCDAdmin] timesflagged 1`)

    execute(`kick @a[scores={APPS=-5},tag=!GCDAdmin] ${disconnect.macro}`)

    //

    // NUKER

    execute(`execute @a[scores={DPPS=${config.maxDPPSExtent.toString()}..}, tag=!GCDAdmin] ~ ~ ~ execute @s ~ ~ ~ tell @a[tag=GCDAdmin] §r§e @s §cwas flagged for Nuker.§r`)

    execute(`scoreboard players set @a[scores={DPPS=${config.maxDPPSExtent.toString()}..}, tag=!GCDAdmin], tag=!GCDAdmin] DPPS -5`)

    execute(`scoreboard players add @a[scores={DPPS=${config.maxDPPSExtent.toString()}..}] timesflagged 1`)

    execute(`kick @a[scores={DPPS=${config.maxDPPSExtent.toString()}..}, tag=!GCDAdmin] ${disconnect.nuker}`)


    execute(`scoreboard players reset @a[scores={DPPS=${config.maxDPPSExtent.toString()}..}, tag=!GCDAdmin] DPPS`)

    //

    execute(`execute @a ~ ~ ~ execute @s[r=0.1]`)

    execute(`execute @a[tag=!GCDAdmin] ~ ~ ~ detect ~ ~-2 ~ air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 /scoreboard players add @s flytime 1`)
    
    execute(`kick @a[tag=GCDBanned] §cYou have been banned from the server.§r`)

    execute(`tell @a[tag=GCDConfig] say GCD Config (/function gcd.help): ${JSON.stringify(config, null, " ")})`);   

    execute(`tag @a remove GCDConfig`);

    

    if (currentTick === 10) {
        execute('tellraw @a[tag=GCDAdmin] {"rawtext":[{"text":"§6[GCD]§r GamingChairDebuff by Imrglop loaded. Do §3/function gcd.help§r for commands. Do /tag <Your Name> add GCDAdmin to get Admin."}]}');
        execute(`tellraw @a[tag=GCDAdmin] {"rawtext":[{"text":"§6[GCD]§r GCD Config (settings): ${JSON.stringify(config, null, " ")}."}]}`)
    }

    execute("scoreboard players add @a[scores={flytime=..-1}] flytime 1");

    currentTick ++;

    //TimesFlagged Kick
    execute(`kick @a[scores={timesflagged=${config.maxTimesFlagged.toString()}..}, tag=!GCDAdmin] §4You have been permanently banned for §cCheating§4. Please contact the server administrators to appeal or if you think this is an error.§r`)
    execute(`scoreboard players reset @a DPPS`)
}

system.shutdown = function() {

}

// by Imrglop
