# DIBBS

> _Discord Bot Backup Service!_

DIBBS is a wrapper for [Discord.js](https://github.com/discordjs/discord.js) which helps make simple things like creating slash commands a whole lot easier.

### Creating a Client

```js
const { Client, EmbedBuilder } = require("@jaxydog/dibbs")

const client = new Client({
	commandGuildId: /* Guild ID */,
	intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"],
	token: /* Bot token */,
})

client.connect()
```
