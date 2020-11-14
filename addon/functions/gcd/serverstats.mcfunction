execute @p ~ ~ ~ tellraw @s[tag=!GCDAdmin] {"rawtext":[{"text":"§cAccess Denied, you must be an administrator.§r"}]}
execute @p ~ ~ ~ tellraw @s[tag=GCDAdmin] {"rawtext":[{"text":"§eFetching Stats...§r"}]}
execute @p ~ ~ ~ execute @s[tag=GCDAdmin] ~ ~ ~ summon gcd:view_server_stats