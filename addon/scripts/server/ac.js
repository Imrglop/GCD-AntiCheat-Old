const system = server.registerSystem(0, 0);

/* 

Made by Imrglop

imrglopyt.000webhostapp.com/releases.html

github.com/Imrglop/GCD-AntiCheat

*/


system.initialize = function() {

}

var clipBlocks = [ // Too many clip blocks will lag the server, make sure you only put solid blocks
  "stone",
  //"bedrock", 
  "dirt", 
  "grass", 
  //"quartz_block", 
  "planks", 
  "wood", 
  //"log", 
  //"concrete", 
  //"stained_hardened_clay"
];

var unbreakable = [
  "invisiblebedrock",
  "end_portal",
  "end_gateway",
  "barrier",
  "bedrock",
  "border_block",
  "structure_block",
  "structure_void",
  "end_portal_frame",
  "light_block",
];  

var illegalItems = [
  "glowingobsidian",
  "end_portal",
  "end_gateway",
  "invisiblebedrock",
  "netherreactor",
  "barrier",
  "structure_block",
  "command_block",
  "structure_void",
  "underwater_torch",
  "lit_furnace",
  "reserved6",
  "info_update"
]
  
var xrayBlocks = [
  "iron_ore",
  "gold_ore",
  "diamond_ore",
  "lapis_ore",
  "redstone_ore",
  "coal_ore",
  "emerald_ore",
  "quartz_ore",
  "nether_gold_ore",
  "ancient_debris"
]
  
var config = {
  "debugMode":true,
  "kickPlayerOnFlag":true,
  "maxCrystals":10,
  "showHealthOnActionbar":0,
  "maxAfkTimeInTicks":12000,
  "maxFlyTime":100, // max ticks to fly before getting kicked
  "maxAPPSExtent":30,
  "maxTimesFlagged":8,
  "maxReach":3.5, // latency cannot be measured, setting this to 3 is not recommended
  "maxDPPSExtent":10,
  "maxReachUses":3 // max times they can hit a mob far away before getting flagged
}
    
var disconnect = {
  "nuker":"§cYou have been kicked for Cheating-Nuker / Block Cheats. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  //"afk":"You have been idle for more than ${config.maxAfkTimeInTicks/60/20} minutes. §7§oDon't worry, you will not be banned or punished any further§r.",
  "reach":"§cYou have been kicked for Cheating/Reach. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "fly":"§cYou have been kicked for Cheating/Fly. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "spawnitem":"§cYou have been kicked for Cheating/Spawning Items. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "macro":"§cYou have been kicked for Cheating/Killaura or AutoClicker. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "adventurebypass":"§cYou have been kicked for Cheating-AdventureBypass / Block Cheats. If you keep doing so, you may get banned. §r If you believe this is an error, contact the server administrators.",
  "crystalaura":"§cYou have been kicked for Cheating / CrystalAura.",
  "toomanypackets":"You are sending too many packets. :("
}


var currentTick = 0;

// Functions

function authorisePunishment() {
    if (config.kickPlayerOnFlag == true) {
        return true;
    }
    return false;
}

//

function broadcast(text, tag) {
    server.log(`Broadcast: ${text.toString()}`)
    let realTag
    if (tag) {
        realTag = tag
    } else realtag = "GCDAdmin";
    execute(`tellraw @a[tag=${realTag}] {"rawtext":[{"text":"§r§6[GCD]§2 ${text}"}]}`)
}


function execute(command, fr) {
    function commandCallBack(commandResults) {
        if (fr != null) {
            broadcast(`Callback: ${JSON.stringify(commandResults.data.statusMessage, null, " ")}`);
        }
    } 
    system.executeCommand(command, (commandResults) => commandCallBack(commandResults))
}

//

// Listen For Events

system.listenForEvent("minecraft:entity_use_item", function(eventData) {

    if (eventData.data.item_stack.item === "minecraft:end_crystal") {
        let pos = system.getComponent(eventData.data.entity, "minecraft:position").data
        execute(`scoreboard players add @p[x=${pos.x}, y=${pos.y}, z=${pos.z}] crystals 1`)
    }

    let result = false;

    for (let i=0; i<illegalItems.length; i++) {

        if (eventData.data.item_stack.item === "minecraft:"+illegalItems[i]) {
            let pos = system.getComponent(eventData.data.entity, "minecraft:position").data
            execute(`execute @p[x=${pos.x}, y=${pos.y}, z=${pos.z}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ clear @p`)
            execute(`execute @p[x=${pos.x}, y=${pos.y}, z=${pos.z}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ tell @a[tag=itemcheatnotify] §r@s[r=10000] §eused an illegal item (minecraft:${illegalItems[i]}).§r`)
            execute(`execute @p[x=${pos.x}, y=${pos.y}, z=${pos.z}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ scoreboard players add @s timesflagged 1`)
            if (authorisePunishment() == true) {
                execute(`execute @p[x=${pos.x}, y=${pos.y}, z=${pos.z}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ kick @s ${disconnect.spawnitem}`)
            }
            result = true;
        }

        if (result) return;
    }
})

//            //
// Reach Check //
//            //

system.listenForEvent("minecraft:player_destroyed_block", function(eventData) {

    let pos = system.getComponent(eventData.data.player, "minecraft:position").data;

    let playerName = system.getComponent(eventData.data.player, "minecraft:nameable").data.name;

    execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}, name="${playerName}"] ~ ~ ~ execute @s[tag=!GCDAdmin, m=a] ~ ~ ~ tell @a[tag=miscnotify] §r§6[GCD]§e @s[r=1000]§e was flagged for §cAdventureBypass§e.`);

    execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}, name="${playerName}"] ~ ~ ~ execute @s[tag=!GCDAdmin, m=a] ~ ~ ~ scoreboard players add @s timesflagged 1`);

    if (authorisePunishment) execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}, name="${playerName}"] ~ ~ ~ execute @s[tag=!GCDAdmin, m=a] ~ ~ ~ kick @s ${disconnect.adventurebypass}`);

    for (let i = 0; i < xrayBlocks.length; i++) {
        if (eventData.data.block_identifier === "minecraft:"+xrayBlocks[i]) {
            var str = xrayBlocks[i].split("_").join(" ");
            broadcast(`(X-Ray) §e${playerName} §7mined ore §e${str}§7.`, `xraynotify`);
        }
    }

    let blockpos = eventData.data.block_position;
    
    for (let i = 0; i < unbreakable.length; i++) {
        if (eventData.data.block_identifier === "minecraft:"+unbreakable[i]) {
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ tell @a[tag=instabreaknotify] §r§6[GCD]§a@s[tag=!GCDAdmin] §cwas flagged for Survival Block Cheats, breaking §e${eventData.data.block_identifier}§c.`)
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ kill`)
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ scoreboard players add @s timesflagged 1`)
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ tellraw @s {"rawtext":[{"text":"§cYou have been flagged for Block Cheats / InstaBreak.§r"}]}`)
        }
    }

 
    let distX = (Math.abs(pos.x - blockpos.x))
    let distY = (Math.abs(pos.y - blockpos.y))
    let distZ = (Math.abs(pos.z - blockpos.z))

    let maxblockreach = 6.5

    // InfiniteBlockReach

    if (distX >= maxblockreach || distY >= maxblockreach || distZ >= maxblockreach) {
        execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ tell @a[tag=blockreachnotify] §r§6[GCD]§e @s[tag=!GCDAdmin] §cwas flagged for Survival Block Reach, reaching ${distX.toString()} x ${distY.toString()} y ${distZ.toString()} z blocks.`)
        execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ scoreboard players add @s[m=s, tag=!GCDAdmin] timesflagged 1`)
    }
    
    execute(`scoreboard players add @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] DPPS 1`)
    
});

system.listenForEvent("minecraft:player_attacked_entity", function(eventData) {

        let attacked = eventData.data.attacked_entity;

        let player = eventData.data.player;

        if (!system.hasComponent(attacked, "minecraft:health")) return;
        if (!system.hasComponent(attacked, "minecraft:position")) return;
        if (!system.hasComponent(attacked, "minecraft:collision_box")) return;

        let attackedpos = system.getComponent(attacked, "minecraft:position").data;

        let attackerpos = system.getComponent(eventData.data.player, "minecraft:position").data;
		
        let attackedhealth = system.getComponent(attacked, "minecraft:health").data;

        if (system.hasComponent(attacked, "minecraft:nameable")) {
            let name = system.getComponent(attacked, "minecraft:nameable");
            if (name === "2391784253917842") {
                execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}"] ~ ~ ~ tell @a[tag=reachnotify] §r@s[r=10000]§c failed Killaura.`)

                execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}"] ~ ~ ~ scoreboard players add @s timesflagged 1`)
                
                if (authorisePunishment() == true) {

                    let nameable = system.getComponent(player, "minecraft:nameable").data.name;
    
                    execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}"] ~ ~ ~ tellraw @s {"rawtext":[{"text":"§cYou have been flagged for Cheating.§r"}]}`)
    
                    execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}"] ~ ~ ~ kill @s`)
                
                }
            }
        }
		

    if (attackedpos != undefined) {
        let hitbox = [0.0, 0.0]; // width x height
        if (system.hasComponent(attacked, "minecraft:collision_box")) { // does entity have a collision box component?
            let hitboxC = system.getComponent(attacked, "minecraft:collision_box");
            hitbox[0] = hitboxC.data.width;
            hitbox[1] = hitboxC.data.height;
        } else return; // if not, don't run this code
        
        let distX = Math.abs(attackedpos.x - attackerpos.x) - hitbox[0]; // width hitbox is subtracted from it

        let distY = Math.abs(attackedpos.y - attackerpos.y) - hitbox[1]; // remove height hitbox

        let distZ = Math.abs(attackedpos.z - attackerpos.z) - hitbox[0];

        if (distX < 0) distX = 0;
        if (distY < 0) distY = 0;
        if (distZ < 0) distZ = 0;

        let distall = ((distX + distZ) / 2) - hitbox[0]// get the more "rounded" version of the hitbox

        if (distall < 0) distall = 0;

        if (attackedhealth.value != undefined) {

            if (config.showHealthOnActionbar == 1) {

                execute(`title @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] actionbar §cHealth: ${(attackedhealth.value).toString()} / ${attackedhealth.max}`);

            }
        }

        execute(`scoreboard players add @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] APPS 1`)

        if (config.debugMode) {
        
            execute(`title @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] actionbar reach: ${distX.toString()} ${distY.toString()} ${distZ.toString()}}`)

        }

        if (distX >= config.maxReach || distZ >= config.maxReach || distall >= config.maxReach - 0.5) {

            let nameable = system.getComponent(player, "minecraft:nameable").data.name;

            // Patch to fix creative mode and admin flagging

            execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ scoreboard players add @s[tag=!GCDAdmin, m=!c, name="${nameable}"] reachflags 1`);

            execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}", scores={reachflags=${config.maxReachUses.toString()}..}] ~ ~ ~ tell @a[tag=reachnotify] §r@s[r=10000]§c failed Reach (x ${distX.toString().substring(0, 3)} y ${distY.toString().substring(0, 3)} z ${distZ.toString().substring(0, 3)} xz: ${distall.toString().substring(0, 3)})§r`)

            execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}", scores={reachflags=${config.maxReachUses.toString()}..}] ~ ~ ~ scoreboard players add @s timesflagged 1`)
            
            if (authorisePunishment() == true) {

                execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}", scores={reachflags=${config.maxReachUses.toString()}..}] ~ ~ ~ tellraw @s {"rawtext":[{"text":"§cYou have been flagged for Cheating.§r"}]}`)

                execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}", scores={reachflags=${config.maxReachUses.toString()}..}] ~ ~ ~ kill @s`)
            
            }
        }
    }

    // Player_attacked_entity doesn't target item or xp 

})

system.listenForEvent("minecraft:block_destruction_stopped", function(eventData) {

        let pos = system.getComponent(eventData.data.player, "minecraft:position").data;
    
        let blockpos = eventData.data.block_position;

        let distX = (Math.abs(pos.x - blockpos.x))
        
        let distY = (Math.abs(pos.y - blockpos.y))
        
        let distZ = (Math.abs(pos.z - blockpos.z))

        let distall = (distX + distZ) / 2
    
        let maxblockreach = 15
    
        // InfiniteBlockReach Check 2 //
    
        if (distX >= maxblockreach || distY >= maxblockreach || distZ >= maxblockreach || distall >= maxblockreach) {
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin] ~ ~ ~ tell @a[tag=blockreachnotify] §r§6[GCD]§e @s[tag=!GCDAdmin] §cfailed InfiniteBlockReach, reaching ${distX.toString().substring(0, 3)} x ${distY.toString().substring(0, 3)} y ${distZ.toString().substring(0, 3)} z blocks.`)
        }
});

system.update = function() {

    if (currentTick === 0) {
        execute(`function gcd/setup`)
    }
    
    if (currentTick % 2 == 0) {
        for (let i = 0; i < clipBlocks.length; i++) {

            execute(`execute @e[tag=!GCDAdmin, type=player] ~ ~ ~ detect ~ ~ ~ ${clipBlocks[i]} -1 tell @a[tag=noclipnotify] §r@s[r=1000] §efailed No-Clip (Clipped through block §aminecraft:${clipBlocks[i]}).`);

            execute(`execute @e[tag=!GCDAdmin, type=player] ~ ~ ~ detect ~ ~ ~ ${clipBlocks[i]} -1 effect @s instant_damage 1 0 true`);

            execute(`execute @e[tag=!GCDAdmin, type=player] ~ ~ ~ detect ~ ~ ~ ${clipBlocks[i]} -1 spreadplayers ~ ~ 0 1 @s`);

            execute(`scoreboard players add @a[scores={crystals=${config.maxCrystals.toString()}..}] timesflagged 1`);

            if (authorisePunishment) {
                execute(`scoreboard players set @a[scores={crystals=${config.maxCrystals.toString()}..}] crystals -5`)
                execute(`kick @a[scores={crystals=-5}] ${disconnect.crystalaura}`);
                execute(`scoreboard players set @a[scores={crystals=-5}] crystals 0`)
            }

            execute(`scoreboard players remove @a[scores={crystals=2..}] crystals 2`);
        }
    }

    // Import Settings

    function cmdCallback(results) {
        let statusMessage = results.data.statusMessage;
        let subbed = (statusMessage.split(" "));
        if (subbed[0] == undefined) return;
        if (subbed[1] != "0") {
            config.maxFlyTime = Number(subbed[1])
        }
    }

    system.executeCommand("scoreboard players test maxflytime GCD -2147483648", (commandResults) => cmdCallback(commandResults))

    function setShowHealth(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))
        config.showHealthOnActionbar = Number(subbed[1])
    }

    system.executeCommand("scoreboard players test showhealth GCD -2147483648", (commandResults) => setShowHealth(commandResults))

    function maxTimesFlagged(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) != 0) {
            config.maxTimesFlagged = Number(subbed[1])
        }
    }
    }

    system.executeCommand("scoreboard players test maxtimesflagged GCD -2147483648", (commandResults) => maxTimesFlagged(commandResults))

    function maxDPPSExtent(results) {

        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 1) {
            config.maxDPPSExtent = Number(subbed[1])
        }
    }
    }
    

    system.executeCommand("scoreboard players test nukerinterval GCD -2147483648", (commandResults) => maxDPPSExtent(commandResults))

    function setKickStatus(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 0) {
            config.kickPlayerOnFlag = false
        } else {
            config.kickPlayerOnFlag = true
        }
    }
    }
    

    system.executeCommand("scoreboard players test neverkick GCD -2147483648", (commandResults) => setKickStatus(commandResults))

    function setDebugMode(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 0) {
            config.debugMode = true
        } else {
            config.debugMode = false
        }
    }
    }

    system.executeCommand("scoreboard players test debugmode GCD -2147483648", (commandResults) => setDebugMode(commandResults))

    function setMaxCrystals(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 1) {
            config.setMaxCrystals = Number(subbed[1])
        }
    }
    }

    system.executeCommand("scoreboard players test maxcrystals GCD -2147483648", (commandResults) => setMaxCrystals(commandResults))

    function setMaxReachTimes(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 0) {
            config.maxReachUses = Number(subbed[1])
        }
    }
    }

    system.executeCommand("scoreboard players test maxreachtimes GCD -2147483648", (commandResults) => setMaxReachTimes(commandResults))


    // FLIGHT

    execute(`execute @a[scores={flytime=${config.maxFlyTime}..}, tag=!GCDAdmin] ~ ~ ~ tell @a[tag=flynotify] §r§6[GCD] §a@s[tag=!GCDAdmin] was flagged for flight, they have been kicked.`)

    execute(`scoreboard players set @a[scores={flytime=${config.maxFlyTime}..}, tag=!GCDAdmin] flytime -333`)

    execute(`scoreboard players add @a[scores={flytime=-333}, tag=!GCDAdmin] timesflagged 1`)

    if (authorisePunishment() == true) {

        execute(`kick @a[scores={flytime=-333}, tag=!GCDAdmin] ${disconnect.fly}`)

    }

    execute(`scoreboard players add @a timesflagged 0`)

    execute(`scoreboard players add @a flytime 0`)

    if (currentTick % 20 === 0) {
        execute(`execute @a[scores={flytime=${Math.floor(config.maxFlyTime*0.35).toString()}..}, tag=!GCDAdmin, m=!c] ~ ~ ~ execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 tell @a[tag=flynotify] §r§6[GCD]§e @s[r=20000]§c is possibly flying.§r`)
        execute(`execute @a[scores={flytime=${Math.floor(config.maxFlyTime*0.35).toString()}..}, tag=!GCDAdmin, m=!c] ~ ~ ~ execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 effect @s instant_damage 1 0`)
        execute(`execute @a[scores={flytime=${Math.floor(config.maxFlyTime*0.35).toString()}..}, tag=!GCDAdmin, m=!c] ~ ~ ~ execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 spreadplayers ~ ~ 0 1 @s`)
    }

    if (currentTick % 200 === 0) {
        execute(`tag @a add GCD_VERIFY1392`)
        execute(`scoreboard players set @a[scores={reachflags=!0}] reachflags 0`);
    }

   if (currentTick % 8 === 0) {
        execute(`scoreboard players remove @a[scores={flytime=1..}] flytime 1`)
    } else if (currentTick % 2 === 0) {
        execute(`scoreboard players remove @a[scores={APPS=1..}] APPS 1`)
        execute(`scoreboard players add @a[scores={APPS=..-1}] APPS 1`)
        execute(`execute @a[scores={APPS=${config.maxAPPSExtent}..},tag=!GCDAdmin] ~ ~ ~ tell @a[tag=killauranotify] §r§e @s §cwas flagged for Killaura.§r`)
        execute(`scoreboard players set @a[scores={APPS=${config.maxAPPSExtent}..},tag=!GCDAdmin] APPS -5`)
        execute(`scoreboard players add @a[scores={APPS=-5},tag=!GCDAdmin] timesflagged 1`)

        // NUKER

        execute(`execute @a[scores={DPPS=${config.maxDPPSExtent.toString()}..}, tag=!GCDAdmin] ~ ~ ~ execute @s ~ ~ ~ tell @a[tag=nukernotify] §r§e @s §cwas flagged for Nuker.§r`)
        execute(`scoreboard players set @a[scores={DPPS=${config.maxDPPSExtent.toString()}..}, tag=!GCDAdmin], tag=!GCDAdmin] DPPS -5`)
        execute(`scoreboard players add @a[scores={DPPS=${config.maxDPPSExtent.toString()}..}] timesflagged 1`)

        //
        execute(`execute @e[type=player, tag=!GCDAdmin, m=!c] ~ ~ ~ detect ~ ~-2 ~ air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 scoreboard players add @s flytime 1`)

        execute(`tell @a[tag=GCDConfig] say GCD Config (/function gcd/help): ${JSON.stringify(config, null, " ")})`);   

        execute(`tag @a remove GCDConfig`);
    }

    // KILLAURA

    if (authorisePunishment() == true) {
        execute(`kick @a[scores={APPS=-5},tag=!GCDAdmin] ${disconnect.macro}`)
        execute(`kick @a[scores={DPPS=${config.maxDPPSExtent.toString()}..}, tag=!GCDAdmin] ${disconnect.nuker}`)
    }

    //

    

    if (currentTick === 20) {
        execute('tellraw @a[tag=GCDAdmin] {"rawtext":[{"text":"[GCD] by Imrglop loaded. Do §3/function gcd/help§r for commands."}]}');
        broadcast(`GCD Config: ${JSON.stringify(config, null, " ")}`, "GCDAdmin")
    }

    execute("scoreboard players add @a[scores={flytime=..-2}] flytime 2");
    execute("scoreboard players add @a[scores={flytime=..-1}] flytime 1");

    currentTick ++;

    //TimesFlagged Kick

    execute(`kick @a[scores={timesflagged=${config.maxTimesFlagged.toString()}..}, tag=!GCDAdmin] §4You have been permanently banned for §cCheating§4. Please contact the server administrators to appeal or if you think this is an error.§r`)
    
    execute(`scoreboard players reset @a DPPS`)

    //execute(`scoreboard players remove @a[scores={crystals=2..}] crystals 1`)

    execute(`kick @a[tag=GCDBanned] §cYou have been banned from the server.§r`)

}

system.shutdown = function() {
    server.log(`[GCD] Shutting down AC..`);
}

server.log("[GCD] by Imrglop loaded.");

// by Imrglop
