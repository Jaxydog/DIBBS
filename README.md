# DIBBS

> _Discord Bot Backend System!_

DIBBS is a wrapper for [discord.js](https://github.com/discordjs/discord.js) that helps make simple things like creating slash commands a whole lot easier.

### Creating a client

```js
const { Client, EmbedBuilder } = require("@jaxydog/dibbs")

const client = new Client({
	commandGuildId: /* Guild ID */,
	intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"],
	token: /* Bot token */,
})

client.connect()
```

### Adding commands

Commands added must be defined prior to creation using `.define`; this ensures that all created commands are sent to the API and can be used. Defined data can be retrieved using `.struct(name)`

On top of the `.commands` property, there is also `.buttons` and `.modals` for creating button and modal templates and callbacks.

```js
// *snip*

client.commands
	.define("ping", {
		name: "ping",
		description: "Checks the bot's connection",
	})
	.create("ping", async ({ interact }) => {
		const embed = new EmbedBuilder().color("BLURPLE")

		await interact.reply({
			embeds: [embed.title("Pong! (...)").color("BLURPLE").build()],
			ephemeral: true,
		})

		const reply = await interact.fetchReply()
		const delay = reply.createdTimestamp - interact.createdTimestamp

		await interact.editReply({
			embeds: [embed.title(`Pong! (${delay}ms)`).build()],
			ephemeral: true,
		})
	})

// *snip*
```

### Storing data

All stored data is saved both locally in `data/` and in memory in `client.storage`. Data stored in the local filesystem is automatically converted to-and-from JSON with UTF-8 encoding.

```js
// *snip*

await client.storage.set("path/to/file", {
	message: "Hello file system!",
})
await client.storage.get("path/to/file")
// => { message: "Hello file system!" }

// *snip*
```
