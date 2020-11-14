
/* 

GCD Anti Cheat - Prevents Cheating in Minecraft Bedrock Dedicated Servers and Worlds
Copyright (C) 2020 Imrglop

*/

const ChatColor = {DARK_RED:"\u00A74",RED:"\u00A7c",GOLD:"\u00A76",DARK_YELLOW:"\u00A7g",YELLOW:"\u00A7e",DARK_GREEN:"\u00A72",GREEN:"\u00A7a",AQUA:"\u00A7b",DARK_AQUA:"\u00A73",DARK_BLUE:"\u00A71",BLUE:"\u00A79",LIGHT_PURPLE:"\u00A7d",DARK_PURPLE:"\u00A75",WHITE:"\u00A7f",GRAY:"\u00A7",DARK_GRAY:"\u00A77",BLACK:"\u00A70",RESET:"\u00A7r",BOLD:"\u00A7l",ITALIC:"\u00A7o",OBFUSCATED:"\u00A7k"};const Component={NAMEABLE:"minecraft:nameable",TAG:"minecraft:tag",POSITION:"minecraft:position",COLLISION_BOX:"minecraft:collision_box"};

var ExtendedConfig = 
{
    "Name Check" : {
        Enabled: true,
        "Allowed Name Characters": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890",
        "Max Characters": 15,
        "On Flagged": 2, // 0: Kick Player, 1: Ban Player, 2: Replace Username (nickname)
        "Name Replacement": "Replaced Username",
        "Kick Message": ChatColor.RED + "You have been kicked from the game for a Fake / Illegal Name."
    } // Checks a player's username to check if it is a fake username
    
}

const system = server.registerSystem(0, 0);

let entityQueue = new Array();

var currentTick = 0;

system.listenForEvent("minecraft:entity_created", (eventData) => {
    const entity = eventData.data.entity;
    if (ExtendedConfig["Name Check"].Enabled == true) {
        if (entity.__identifier__ === "minecraft:player" && system.hasComponent(entity, Component.NAMEABLE)) {
            entity.tickTime = (currentTick + 1);
            entityQueue.push(entity);
        }
    }
});

system.update = function() {
    if (ExtendedConfig["Name Check"].Enabled == true && entityQueue.length > 0) {
        for (entity in entityQueue) {
            let entityObj = entityQueue[entity];
            if (entityObj && system.isValidEntity(entityObj)) {
                const tag = system.getComponent(entityObj, "minecraft:tag")
                if (tag.data.includes('GCDAdmin') 
                    || tag.data.includes('GCDBanned')) return;

                const name = system.getComponent(entityObj, Component.NAMEABLE).data.name;
                const splitName = name.split("")
                const allowedChars = ExtendedConfig["Name Check"]["Allowed Name Characters"].split("");
                for (char of splitName) {
                    if (allowedChars.includes(char) && name.length <= 15 && name.length > 0)
                        continue;
                    // On Flagged:
                    switch(ExtendedConfig["Name Check"]["On Flagged"]) {
                        case 0: 
                            system.executeCommand(`kick @a[name="${name}"] ${ExtendedConfig["Name Check"]["Kick Message"]}`, () => {});
                            break;
                        case 1:
                            tag.data.push('GCDBanned');
                            system.applyComponentChanges(entityObj, tag);
                            break;
                        case 2:
                            let newName = system.getComponent(entityObj, Component.NAMEABLE);
                            newName.data.name = ExtendedConfig["Name Check"]["Name Replacement"];
                            system.applyComponentChanges(entityObj, newName);
                            break;
                    }
                }
            } else {
                entityQueue[entityObj] = undefined;
                delete entityQueue[entityObj];
            }
        }
    }
    currentTick++;
}