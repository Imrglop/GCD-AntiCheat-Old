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
No-clip\
CrystalAura

# Version
Version: 1.3.2\
\
Works On: 1.16
# Information
\
No anti cheat is perfect so this one isn't perfect. Right now there is a problem with occasional false flagging for flags such as Reach (reduced in 1.3.2), Flight and occasional No-clip (both are currently command-based). If you are testing this, to make sure players don't get kicked when they cheat, do /scoreboard players set neverKick GCD 1. This will give them a timesflagged count, but won't kick them when they get flagged. However, if they have been flagged for enough times, they will get auto-banned.