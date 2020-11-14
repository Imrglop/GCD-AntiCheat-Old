
# [GCD] AntiCheat

\

The GCD AntiCheat uses the vanilla Scripting API to fight weaknesses in Minecraft: Bedrock Edition.

# Setup

  

Since this uses the Scripting API, this will only work in Windows 10 servers, for example, a windows 10 edition hosted world or dedicated server.\

Make sure you enable Experimental Gameplay on your world after installing the addon. \

Once you have did that, to get GCDAdmin (to not get flagged) simply do /function gcd/admin .\

To be notified for all detected cheats, do /function notify/on/all .\

To edit the config, you can either edit the script itself, or to edit the ingame config do /function gcd/help \

It will show you how to edit the config ingame. To view the config, do /tag @s add GCDConfig

# Flags

Killaura / AutoClicker\

Reach \

Nuker\

InfiniteBlockReach\

Illegal block breaking (InstaBreak)\

Illegal Items\

X-Ray Notifier\

Fly\

CrystalAura\

AdventureModeBypass\

High Sharpness, Bane of arthropods or smite level\

Fake / illegal name\

Unusual Movement

  

# Version

Version: 1.3.5\

\

Works On: 1.16

  

# Full Ingame Config

First make sure it's turned on, copy some JSON, do `/summon gcd:config "Paste JSON Here"` (make sure you put quotations and JSON needs to have backslash before each `"`) then do `/function gcd/config/reload` (This command may crash the server in BDS; make sure you give some time after spawning the entity)

example / default:

```json
{\"fullIngameConfig\":true,\"debugMode\":true,\"kickPlayerOnFlag\":true,\"maxCrystals\":10,\"showHealthOnActionbar\":0,\"maxFlyTime\":100,\"flyCheckEnabled\":true,\"maxAPPSExtent\":30,\"maxTimesFlagged\":8,\"automaticBan\":true,\"maxReach\":3.5,\"maxReachUses\":3,\"maxDPPSExtent\":10,\"NukerAffectedByTPS\":true,\"sharpnessCheck\":true,\"maxDamage\":30,\"movementCheck\":true,\"allowElytras\":true,\"movementCheckCooldown\":2,\"movementCheckTolerance\":3.04}
```