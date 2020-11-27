const system = server.registerSystem(0, 0);

/* 

GCD Anti Cheat - Prevents Cheating in Minecraft Bedrock Dedicated Servers and Worlds
Copyright (C) 2020 Imrglop

*/

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
  "info_update",
  "spawn_egg",
  "fire"
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

  "fullIngameConfig" : true, // Allows you to set anything in the config in-game by adding the string json to gcd:config entity as a tag then reloading the config
  // currently will not save when you reload the world / server
  // view readme for how to use

  "debugMode": true,
  "kickPlayerOnFlag":true, //to kick or respawn a player whenever they get flagged
  "maxCrystals":10, // for anti auto-crystal / crystalaura
  "showHealthOnActionbar":0,

  "maxFlyTime":100, // max semi-ticks to fly before getting kicked
    "flyCheckEnabled": true,

  "maxAPPSExtent":30,
  "maxTimesFlagged":8,
  "automaticBan": true, // automatic ban when they exceed maxtimesflagged amount

  "maxReach":3.5, 
   /* 
   latency cannot be measured, setting max reach to 3 is not recommended
   Reach measurement is not exact 
   */
  
    "maxReachUses":3, // max times they can hit an entity far away before getting flagged

  "maxDPPSExtent":10, // nuker: blocks to break in a single tick
    "NukerAffectedByTPS": true, // Recommended to keep at true

  "sharpnessCheck":true, // check how much damage a player deals
    "maxDamage": 30,

  "movementCheck": true, // anti Speed, Bhop, glide, jetpack, etc
    "allowElytras": true, // allow elytras in the movement check and fly check
    "movementCheckCooldown": 2, // At least 2
    "movementCheckTolerance": 3.04, // How much they can move within a tick (1/20 of a second usually)
  "exploitPatch": true // Patch exploits that players can use to run commands without OP
}
    
var disconnect = {
  "nuker":"§cYou have been kicked for Cheating-Nuker / Block Cheats. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  //"afk":"You have been idle for more than ${config.maxAfkTimeInTicks/60/20} minutes. §7§oDon't worry, you will not be banned or punished any further§r.",
  "reach":"§cYou have been kicked for Cheating/Reach. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "fly":"§cYou have been kicked for Cheating/Fly. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "spawnitem":"§cYou have been kicked for Cheating/Spawning Items. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "macro":"§cYou have been kicked for Cheating/Killaura or AutoClicker. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "adventurebypass":"§cYou have been kicked for Cheating-AdventureBypass / Block Cheats. If you keep doing so, you may get banned. §r If you believe this is an error, contact the server administrators.",
  "crystalaura":"§cYou have been kicked for Cheating / CrystalAura."
}

/**
 * Player data is stored here. Entity Id : String JSON
 * @type {Map<number, string>}
 */
var playerData = new Map();

var configEntity;

var ServerStats = {
    TPS: 20, // Needed to stop certain false flags just because it's laggy
    MSPT: 50
}

var MSPTTimings = {
    thisTime: Date.now(),
    lastTime: Date.now()
}

function loadConfig() {
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
    

    system.executeCommand("scoreboard players test nukertolerance GCD -2147483648", (commandResults) => maxDPPSExtent(commandResults))

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

    function setMaxDamage(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 0) {
            config.maxDamage = Number(subbed[1])
        }
    }
    }

    system.executeCommand("scoreboard players test maxdamage GCD -2147483648", (commandResults) => setMaxDamage(commandResults))
}

system.initialize = function() {
    if (config.debugMode) {
        var scriptLoggerConfig = this.createEventData("minecraft:script_logger_config");
        scriptLoggerConfig.data.log_errors = true;
        scriptLoggerConfig.data.log_information = true;
        scriptLoggerConfig.data.log_warnings = true;
        this.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);
        server.log("Debug Mode Enabled");
    }
    loadConfig();
}

var currentTick = 0;

var playerPositions = [/* object player */]

// Functions

function authorisePunishment() {
    if (config.kickPlayerOnFlag == true) {
        return true;
    }
    return false;
}

//

/**
 * Send a GCD message to the console and to a certain tag
 * @param {string} text 
 * @param {string} tag defaults to GCDAdmin
 */
function broadcast(text, tag) {
    server.log(`Broadcast: ${text.toString()}`)
    let realTag
    if (tag) {
        realTag = tag
    } else realtag = "GCDAdmin";
    let stringify = `§r§6[GCD]§2 ${text}`;
    execute(`tellraw @a[tag=${realTag}] {"rawtext":[{"text":${JSON.stringify(stringify)}}]}`)
}

system.FlyCheck = (plr, posDiff, pastPos, currentPos, lastOnGround, onGround) => {
    // TODO: add better fly check
    const MinecraftDist = 0.9800000190734863;
    const yDist = posDiff[1];
    const pDist = (yDist - 0.08) * MinecraftDist;
}

function PlayerMoveEvent (plr, posDiff, pastPos, currentPos, lastOnGround, onGround) {

    let tags = system.getComponent(plr, "minecraft:tag");

    if (plr.speedFlagD == undefined) {
        plr.speedFlagD = 0;
        return;
    }

    if (!tags) return;
    if (!tags.data.includes('GCDAdmin')) {
    
        let moveXZ = (posDiff[0] + posDiff[2])
        let moveY = (currentPos[1] - currentPos[1]);


        /*
        normally: 0.2212...
        sprinting: 0.3825...
        sprint jumping: .. 1.1

        jumping: Y = 0.373...
        flying: Y = 0.375...
        */
        
        if (config.debugMode == true) execute(`title @a actionbar §3XZ:§b ${moveXZ}\n§3Y:§b ${moveY}`)

        let LogicalMovementCheckTolerance = ((config.movementCheckTolerance * 20) / ServerStats.TPS); // Anti false speed flag based on the TPS

        if (plr.hasElytra) {
            return;
        }

        if (LogicalMovementCheckTolerance < config.movementCheckTolerance)
            LogicalMovementCheckTolerance = config.movementCheckTolerance

        if (moveXZ > LogicalMovementCheckTolerance || moveY > LogicalMovementCheckTolerance) {
            if (moveXZ > 40) {
                // teleported probably
                return;
            }


            let posComponent = system.getComponent(plr, "minecraft:position")

            plr.speedFlagD++;

            if (!(tags.data.includes("speedFlag")) && plr.speedFlagD >= 1) {
                plr.speedFlagD = 0;
                posComponent.data.x = pastPos[0] // pastPos is the past position
                posComponent.data.y = pastPos[1]
                posComponent.data.z = pastPos[2]
                system.applyComponentChanges(plr, posComponent); 
                if (system.hasComponent(plr, 'minecraft:nameable')) {
                    let name = system.getComponent(plr, 'minecraft:nameable').data.name
                    broadcast(`Player §e${name}§2 failed §aSpeed§c (Velocity:${moveXZ.toString()}) (Max: ${LogicalMovementCheckTolerance})`, 'speednotify');
                    let tag = system.getComponent(plr, 'minecraft:tag');
                    tag.data.push('speedFlag');
                    system.applyComponentChanges(plr, tag);
                }
            }

            // apply the changes to the player position instead of relying on commands

            //execute(`tp @a[tag=!speedFlag, name="${system.getComponent(plr, "minecraft:nameable").data.name}"] ${playerPosition[0]} ${playerPosition[1]} ${playerPosition[2]}`)
            
        }
        // Is non admin
        //execute(`say ${Math.abs(playerPosition[0] - currentPosition[0])}, ${Math.abs(playerPosition[1] - currentPosition[1])} ${Math.abs(playerPosition[2] - currentPosition[2])}`)
    }
}

/**
 * Run command quickly without requiring second argument
 * @param {string} command 
 */
function execute(command) {
    system.executeCommand(command, () => {});
}


/**
 * Saves player data to hashmap
 * @param {number} playerID 
 * @param {object} playerData 
 */
function savePlayerData(playerID, plrData) {
    let dataStore = JSON.stringify(plrData);
    playerData.set(playerID, dataStore);
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
            execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ clear @p`)
            execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ tell @a[tag=itemcheatnotify] §r@s[r=10000] §eused an illegal item (minecraft:${illegalItems[i]}).§r`)
            execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ scoreboard players add @s timesflagged 1`)
            if (authorisePunishment() == true) {
                execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ kick @s ${disconnect.spawnitem}`)
            }
            result = true;
        }

        if (result) return;
    }
})

system.listenForEvent("minecraft:entity_hurt", function(eventData) {
    if (!config.sharpnessCheck || !(eventData.data.attacker)) return;
    if (eventData.data.damage)
        if (eventData.data.attacker)
            if (eventData.data.attacker.__identifier__ == "minecraft:player") {
                let maxDmg = config.maxDamage // + system.getComponent(eventData.data.attacker, "minecraft:attack").data.damage;
                let attacker = eventData.data.attacker;
                if (system.hasComponent(attacker, "minecraft:position") && eventData.data.damage > maxDmg) {
                    let pos = system.getComponent(attacker, "minecraft:position").data;
                    execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ scoreboard players add @s[tag=!GCDAdmin] timesflagged 1`)
                    execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ clear @s[tag=!GCDAdmin]`)
                    if (authorisePunishment) execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ kick @s[tag=!GCDAdmin] ${disconnect.spawnitem}`);
                    execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ tell @a[tag=miscnotify] §r§6[GCD] §a@s[r=222]§r suspicious amount of damage: ${eventData.data.damage}`)
                }
    }
});

system.listenForEvent("minecraft:entity_death", function(eventData) {
    if (eventData.data.entity.__identifier__ == "minecraft:player") {
        let tags = system.getComponent(eventData.data.entity, "minecraft:tag");
        if (!tags) return;
        if (!(tags.data.includes("speedFlag"))) {
            // does not contain speedflag tag
            tags.data.push("speedFlag"); // stop them from getting flagged by just respawning
            system.applyComponentChanges(eventData.data.entity, tags);
        }
    }
});

//            //
// Reach Check //
//            //

var playerList = new Map();

system.listenForEvent("minecraft:entity_created", function(eventData) {
    const {
        data: {
            entity
        }
    } = eventData;

    if (entity.__identifier__ == "gcd:reload_config") {
        loadConfig()
        if (config.fullIngameConfig && configEntity && system.isValidEntity(configEntity)) {
            let name = system.getComponent(configEntity, "minecraft:nameable");
            if (name && name.data.name != "") {
                // parse the config from the name
                let parseTo = (name.data.name).split('\\').join('');
                try {
                    config = JSON.parse(parseTo);
                    broadcast('Trying to parse config..', 'GCDAdmin')
                } catch (exception) {
                    broadcast('§cCould not load config from entity! §eJSON Error: ' + exception.toString(), 'GCDAdmin')
                }
            } else {
                broadcast('§cCould not load config from entity! §eEntity does not have name' , 'GCDAdmin')
            }
            system.destroyEntity(configEntity);
        }
        broadcast("Config reloaded from scoreboard or config entity", "GCDAdmin")
        system.destroyEntity(entity);
    }

    if (config.fullIngameConfig && entity.__identifier__ == "gcd:config") {
        configEntity = entity;
    }
    
    if (entity.__identifier__ === "minecraft:player" && system.hasComponent(entity, "minecraft:position")) {
        if (system.hasComponent(entity, "minecraft:nameable")) {
            if (system.getComponent(entity, "minecraft:nameable").data.name != "") {
                execute(`tag @a add GCD_VERIFY1392`)
                playerData.set(entity.id, JSON.stringify({
                    reachFlags : 0,
                    APPS : 0,
                    DPPS : 0
                }))
                if (eventData.data.entity.__identifier__ === "minecraft:player") {
                    if (system.hasComponent(eventData.data.entity, "minecraft:nameable")) {
                        let name = system.getComponent(eventData.data.entity, "minecraft:nameable");
                        playerList.set(name, eventData.data.entity)
                    }
                }

                let posObj = system.getComponent(entity, "minecraft:position");
                let pos = posObj.data;
                entity.pastPosition = pos;
                // No problem here
                playerPositions.push({plr: entity});
            }
        }
    
    }

    if (entity.__identifier__ === "gcd:view_server_stats") {
        let tpsColor = ''
        let msptColor = ''
        if (ServerStats.TPS > 18) tpsColor = '§a'
            else if (ServerStats.TPS > 14) tpsColor = '§e'
            else if (ServerStats.TPS > 8) tpsColor = '§c'
            else if (ServerStats.TPS > 4) tpsColor = '§4'
            else tpsColor = '§l§0' 
        
        if (ServerStats.MSPT < 55) msptColor = '§a'
            else if (ServerStats.MSPT < 71) msptColor = '§e'
            else if (ServerStats.MSPT < 125) msptColor = '§c'
            else if (ServerStats.MSPT < 250) msptColor = '§4'
            else msptColor = '§l§0'
        
        broadcast(`§l§b[ Server Stats ] \n§r§2TPS: ${tpsColor}${ServerStats.TPS}§r\n§2MSPT: ${msptColor}${ServerStats.MSPT}\n§o§7(May not be 100% accurate)`, 'GCDAdmin');
        system.destroyEntity(entity);
    }

});

system.listenForEvent("minecraft:player_placed_block", (ev) => {
    const {
        data: {
            block_position,
            player
        }
    } = ev;

    if (config.exploitPatch) {
        // ---  get the block type ---

        // 1: get tickingarea
        let tick_world = system.getComponent(player, "minecraft:tick_world");
        if (tick_world) {
            const block = system.getBlock(tick_world.data.ticking_area, block_position);
            let blockstateComponent = system.getComponent(block, "minecraft:blockstate");
            switch (block.__identifier__) {
                case "minecraft:dispenser":
                    // stops players from placing dispenser with NBT data, can be used to exploit
                    execute(`setblock ${block_position.x} ${block_position.y} ${block_position.z} dispenser ${blockstateComponent.data.facing_direction}`);
                    break;
                case 'minecraft:movingBlock': // patch the movingBlock exploit
                    execute(`setblock ${block_position.x} ${block_position.y} ${block_position.z} air`);
                    break;
                case "minecraft:beehive":
                    execute(`setblock ${block_position.x} ${block_position.y} ${block_position.z} beehive`);
                    break;
                case "minecraft:bee_nest":
                    execute(`setblock ${block_position.x} ${block_position.y} ${block_position.z} bee_nest`);
                    break;
                case "minecraft:hopper":
                    execute(`setblock ${block_position.x} ${block_position.y} ${block_position.z} hopper ${blockstateComponent.data.facing_direction}`);
                    break;
            }
        }
    }
})

system.listenForEvent("minecraft:player_destroyed_block", function(eventData) {
    const player = eventData.data.player;
    let pos = system.getComponent(player, "minecraft:position").data;
    let name = system.getComponent(player, "minecraft:nameable");
    let playerName = system.getComponent(player, "minecraft:nameable").data.name;
    let tag = system.getComponent(player, 'minecraft:tag');
    if (tag && !tag.data.includes('GCDAdmin')) {
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

        if (distX > maxblockreach || distY > maxblockreach || distZ > maxblockreach) {
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ tell @a[tag=blockreachnotify] §r§6[GCD]§e @s[tag=!GCDAdmin] §cwas flagged for Survival Block Reach, reaching ${distX.toString()} x ${distY.toString()} y ${distZ.toString()} z blocks.`)
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ scoreboard players add @s[m=s, tag=!GCDAdmin] timesflagged 1`)
        }
        
        let data = JSON.parse(playerData.get(player.id));
        data.DPPS++;
        savePlayerData(player.id, data);

        let MaxNukerValueExtent = config.maxDPPSExtent;
        if (config.NukerAffectedByTPS == true) {
            MaxNukerValueExtent = Math.floor((config.maxDPPSExtent * 20) / ServerStats.TPS);
            MaxNukerValueExtent = (MaxNukerValueExtent < config.maxDPPSExtent) ? config.maxDPPSExtent : MaxNukerValueExtent; // make the minimum the one in the config
        }

        if (data.DPPS > MaxNukerValueExtent) {
            // NUKER
            broadcast(`Player §e${name.data.name}§2 failed §cNuker§e (blocks: §c${data.DPPS}§r / ${MaxNukerValueExtent}§e)`, 'nukernotify')
            execute(`scoreboard players add @a[name="${name.data.name}"] timesflagged 1`)
            execute(`kick @a[name="${name.data.name}"] ${disconnect.nuker}`)
            data.DPPS = 0;
        }
    }
});

system.listenForEvent("minecraft:player_attacked_entity", function(eventData) {

    let attacked = eventData.data.attacked_entity;
    let player = eventData.data.player;

    if (!system.hasComponent(attacked, "minecraft:health")) return;
    if (!system.hasComponent(attacked, "minecraft:position")) return;
    if (!system.hasComponent(attacked, "minecraft:collision_box")) return;

    let attackedpos = system.getComponent(attacked, "minecraft:position").data;
    let attackerpos = system.getComponent(player, "minecraft:position").data;
    let attackedhealth = system.getComponent(attacked, "minecraft:health").data;    
    let tag = system.getComponent(player, "minecraft:tag");
		
    if (attackedpos != undefined && !tag.data.includes('GCDAdmin')) {
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

            let distall = ((distX + distZ) / 2) - hitbox[0] // get the more "rounded" version of the range
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

            if (distX > config.maxReach || distZ > config.maxReach || distall > config.maxReach - 0.5) {

                let nameable = system.getComponent(player, "minecraft:nameable").data.name;

                // Patch to fix creative mode and admin flagging
                // bookmark:reach

                if (!playerData.has(player.id)) {
                    playerData.set(player.id, JSON.stringify({
                        reachFlags : 0,
                        APPS : 0,
                        DPPS : 0
                    }))
                }
                let data = JSON.parse(playerData.get(player.id));
                data.reachFlags++;
                savePlayerData(player.id, data);
                if (data.reachFlags > config.maxReachUses) {
                    system.executeCommand(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ testfor @s[m=!c, name="${nameable}"]`, (c) => {
                        if (c.data.statusCode == 0) { // if /testfor command succeded
                            /**
                             * @type {number}
                             */
                            broadcast(`Player §e${nameable}§2 failed §cReach§2 (x: ${distX.toFixed(1)} y: ${distY.toFixed(1)} z: ${distZ.toFixed(1)} xz: ${distall.toFixed(1)})`, 'reachnotify');
                            execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[m=!c, name="${nameable}"] ~ ~ ~ scoreboard players add @s timesflagged 1`)
                            if (authorisePunishment() == true) {
                                system.executeCommand(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[m=!c, name="${nameable}"] ~ ~ ~ tellraw @s {"rawtext":[{"text":"§cYou have been flagged for Cheating.§r"}]}`, () => {})
                            }
                            let health = system.getComponent(player, "minecraft:health");
                            health.data.value = 0.0;
                            system.applyComponentChanges(player, health);
                        }
                    })
                }
            }

        }
    

})

system.listenForEvent("minecraft:block_destruction_stopped", function(eventData) {
    const player = eventData.data.player;

	let pos = system.getComponent(eventData.data.player, "minecraft:position").data;
    let blockpos = eventData.data.block_position;
    let distX = (Math.abs(pos.x - blockpos.x))
    let distY = (Math.abs(pos.y - blockpos.y))
    let distZ = (Math.abs(pos.z - blockpos.z))
    let distall = (distX + distZ) / 2
    let maxblockreach = 15
    
    // InfiniteBlockReach Check 2 //
    
    if (!system.getComponent(player, 'minecraft:tag').data.includes('GCDAdmin'))
        if (distX > maxblockreach || distY > maxblockreach || distZ > maxblockreach || distall > maxblockreach) {
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin] ~ ~ ~ tell @a[tag=blockreachnotify] §r§6[GCD]§e @s[tag=!GCDAdmin] §cfailed InfiniteBlockReach, reaching ${distX.toString().substring(0, 3)} x ${distY.toString().substring(0, 3)} y ${distZ.toString().substring(0, 3)} z blocks.`)
        }
});

system.update = function() {

    //bookmark:update
    MSPTTimings.thisTime = Date.now();
    ServerStats.MSPT = MSPTTimings.thisTime - MSPTTimings.lastTime;
    ServerStats.TPS = (Number((1000/ServerStats.MSPT).toFixed(1)));

    if (config.exploitPatch) {
        // clear bucket of fish
        execute(`execute @a[m=!c, tag=!GCDAdmin] ~ ~ ~ function gcd/exploitPatch/bucket`);
    }

    if (currentTick === 0) {
        execute(`function gcd/setup`)
    }
    
    if (currentTick % 2 == 0) {

        execute(`scoreboard players set @a[scores={crystals=${config.maxCrystals.toString()}..}] crystals -5`)

        if (authorisePunishment) {
            //system.executeCommand(`testfor @a[scores={crystals=${config.maxCrystals.toString()}..}]`, (cc) => {if (cc.data.victims) {
                execute(`kick @a[scores={crystals=-5}] ${disconnect.crystalaura}`);
                
            //}})
        }

        execute(`scoreboard players add @a[scores={crystals=-5}] timesflagged 1`);
        execute(`scoreboard players set @a[scores={crystals=-5}] crystals 0`)
        execute(`scoreboard players remove @a[scores={crystals=2..}] crystals 2`);
    }
    
    execute(`scoreboard players add @a timesflagged 0`)
    
    if (currentTick % config.movementCheckCooldown === 0) {
        execute(`tag @a remove speedFlag`);
        if (playerPositions.length != 0)
            for (let i in playerPositions) {
                const obj = playerPositions[i];
                if (!(system.isValidEntity(obj.plr))) {
                    delete playerPositions[i];
                    delete obj;
                    return;
                }

                let plr = obj.plr;

                if (config.allowElytras) {

                    let armor_container = system.getComponent(plr, "minecraft:armor_container")
                    if (armor_container == undefined) return;
                    let hand_container = system.getComponent(plr, "minecraft:hand_container");
                    if (!hand_container) return;
                    if (!(system.hasComponent(plr, "minecraft:tag"))) return;
                    let tagComponent = system.getComponent(plr, "minecraft:tag");

                    if (armor_container.data[1].item !== "minecraft:elytra") {
                        plr.hasElytra = false;
                        if (tagComponent.data.includes("hasElytra")) {
                            for (let tag in tagComponent.data) {
                                if (tagComponent.data[tag] == "hasElytra") {
                                    tagComponent.data[tag] = undefined;
                                    system.applyComponentChanges(plr, tagComponent);
                                    break;
                                }
                            }
                        }
                    }

                    else if (armor_container.data[1].item === "minecraft:elytra") {
                            // doesn't matter if they aren't using fireworks or not here
                            if (!tagComponent.data.includes("hasElytra")) {
                                tagComponent.data.push("hasElytra");
                                system.applyComponentChanges(plr, tagComponent);
                            }
                            if ( hand_container.data[0].item === "minecraft:fireworks" || hand_container.data[1].item === "minecraft:fireworks") {
                            // if they have an elytra give them a tag and set a boolean value that they do have an elytra
                            // only when they are using it with fireworks
                            plr.hasElytra = true;
                        }
                    }

                }

            }
    }

    if (currentTick % 60 === 0) {
        if (playerData.size > 0)
            for (let [k, v] of playerData) {
                let obj = JSON.parse(v);
                obj.reachFlags = 0;
                savePlayerData(k, obj);
            }
    } else if (currentTick % 2 === 0) {
        let KATolerance = ((config.maxAPPSExtent * 20) / ServerStats.TPS)
        execute(`scoreboard players remove @a[scores={APPS=1..}] APPS 1`)
        execute(`scoreboard players add @a[scores={APPS=..-1}] APPS 1`)
        execute(`execute @a[scores={APPS=${Math.floor(KATolerance)}}..},tag=!GCDAdmin] ~ ~ ~ tell @a[tag=killauranotify] §r§e @s §cwas flagged for Killaura.§r`)
        execute(`scoreboard players set @a[scores={APPS=${Math.floor(KATolerance)}..},tag=!GCDAdmin] APPS -5`)
        execute(`scoreboard players add @a[scores={APPS=-5},tag=!GCDAdmin] timesflagged 1`)

        execute(`tell @a[tag=GCDConfig] §r§fGCD Config (/function gcd/help): §a${JSON.stringify(config, null, " ")})`);   
        execute(`tag @a remove GCDConfig`);
    }

    // KILLAURA

    if (authorisePunishment() == true) {
        execute(`kick @a[scores={APPS=-5},tag=!GCDAdmin] ${disconnect.macro}`)
    }

    if (currentTick === 20) {
        execute('tellraw @a[tag=GCDAdmin] {"rawtext":[{"text":"[GCD] by Imrglop loaded. Do §3/function gcd/help§r for commands."}]}');
        broadcast(`GCD Config: ${JSON.stringify(JSON.stringify(config, null, " "))}`, "GCDAdmin")
    }

    execute("scoreboard players add @a[scores={flytime=..-2}] flytime 2");
    execute("scoreboard players add @a[scores={flytime=..-1}] flytime 1");

    currentTick ++;

    //TimesFlagged Kick

    if (config.maxTimesFlagged)
        execute(`kick @a[scores={timesflagged=${config.maxTimesFlagged.toString()}..}, tag=!GCDAdmin] §4You have been permanently banned for §cCheating§4. Please contact the server administrators to appeal or if you think this is an error.§r`)
    
    if (playerData.size > 0)
        for ([k, v] of playerData) {
            let obj = JSON.parse(v);
            obj.DPPS = 0;
            savePlayerData(k, obj);
        }

    execute(`kick @a[tag=GCDBanned] §cYou have been banned from the server.§r`)

    if (config.movementCheck)
        if (playerPositions.length > 0) {
            for (let plr in playerPositions) {
                let player = playerPositions[plr].plr;
                if (system.isValidEntity(player)) {
                    if (system.hasComponent(player, 'minecraft:position')) {
                        //try {
                            const currentPos = system.getComponent(player, "minecraft:position").data;
                            const pastPos = player.pastPosition;
                            let positionDifference = [(Math.abs(currentPos.x - pastPos.x)), (Math.abs(currentPos.y - pastPos.y)), (Math.abs(currentPos.z - pastPos.z))]
                            
                            if (positionDifference[0] != 0 || positionDifference[1] != 0 || positionDifference[2] != 0) {
                                let currentonground = null;
                                let onground = null;
                                if (system.hasComponent(player, "minecraft:tick_world")) {
                                    let tickarea = system.getComponent(player, "minecraft:tick_world").data.ticking_area;
                                    let tempPastPos = pastPos.valueOf();
                                    tempPastPos.y -= 0.1;
                                    let lastBlock = system.getBlock(tickarea, tempPastPos)
                                    if (lastBlock) {
                                        onground = (lastBlock.__identifier__ == "minecraft:air") ? false : true ;

                                        tempPastPos = currentPos.valueOf();
                                        tempPastPos.y -= 0.1;
                                        lastBlock = system.getBlock(tickarea, tempPastPos)
                                        currentonground = (lastBlock.__identifier__ == "minecraft:air") ? false : true ;
                                    }
                                }

                                PlayerMoveEvent (player, positionDifference, [pastPos.x, pastPos.y, pastPos.z], [currentPos.x, currentPos.y, currentPos.z], onground, currentonground)
                                player.pastPosition = system.getComponent(player, "minecraft:position").data;
                            }
                        //} catch (exception) {execute(`title @a actionbar ${exception}`)}
                    }
                } else {
                    delete playerPositions[plr];
                }
            }
        }
    MSPTTimings.lastTime = Date.now();
}

system.shutdown = function() {
    server.log(`[GCD] Shutting down AC..`);
}

server.log("[GCD] Anti Cheat by Imrglop loaded.");
