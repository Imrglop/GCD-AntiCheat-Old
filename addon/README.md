# [GCD] AntiCheat
\
The GCD AntiCheat uses the vanilla Scripting API to fight weaknesses in Minecraft: Bedrock Edition.
# Setup
\
Minecraft World for Windows:\
Download the `addon` folder as `.zip`, then extract it as a folder to:\
`AppData\Local\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\behavior_packs`.\
Then, enable Experimental Gameplay and `Additional Modding Capabilities` option on your world add apply the behavior pack.\
Make sure it is a folder or the script may not load correctly.\
\
Behavior Pack for BDS:\
Note: If you do `/function gcd/config/reload` in a BDS, it will crash the server due to a bug\
Place the `addon` folder at `behavior_packs` in your server folder (It's better to be in `development_behavior_packs` so it's easy to edit config)\
Then go to `worlds` folder, find the world, if there isn't, add a file called `world_behavior_packs.json`, open it and paste / add the following
```json
[
	{
		"pack_id" : "b96955a3-918c-4bab-ae0d-dd827e23e0e5",
		"version" : [ 1, 3, 5 ]
	}
]
```
Make sure you have Experimental Gameplay enabled on your server. You can do this by using an NBT editor or by placing your world in your minecraft worlds directory, going to it in game and turning it on that way. Then you can export it back to your server.