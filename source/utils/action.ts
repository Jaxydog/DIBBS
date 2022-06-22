import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v10"
import {
	ApplicationCommandDataResolvable,
	ButtonInteraction,
	CommandInteraction,
	ModalSubmitInteraction,
} from "discord.js"
import { ActionManager, DefinedActionManager } from "../internal/action"

export class ButtonManager extends ActionManager<ButtonInteraction> {
	protected _createListener() {
		this._client.on("interactionCreate", (interact) => {
			if (interact.isButton()) {
				const dataId = interact.customId.includes(";")

				if (this.exists(interact.customId, dataId)) {
					this.invoke(interact.customId, interact, dataId)
				} else {
					this._logger.warn(`Invalid button: ${interact.customId}`)
				}
			}
		})
	}
}
export class CommandManager extends DefinedActionManager<CommandInteraction, ApplicationCommandDataResolvable> {
	protected _createListener() {
		this._client.on("interactionCreate", (interact) => {
			if (interact.isCommand() && this.exists(interact.commandName)) {
				this.invoke(interact.commandName, interact)
			}
		})
	}

	public async update(token: string, guildId: string, global = false) {
		const body = [...this._data.values()]
		const rest = new REST({ version: "10" }).setToken(token)

		try {
			await rest.put(Routes.applicationGuildCommands(this._client.user!.id, guildId), { body })
			this._logger.info(`Refreshed ${body.length} guild commands`)

			if (global) {
				await rest.put(Routes.applicationCommands(this._client.user!.id), { body })
				this._logger.info(`Refreshed ${body.length} global commands`)
			}
		} catch (error) {
			this._logger.warn(`Unable to refresh commands\n\t${error}`)
		}
	}
}
export class ModalManager extends ActionManager<ModalSubmitInteraction> {
	protected _createListener() {
		this._client.on("interactionCreate", (interact) => {
			if (interact.isModalSubmit()) {
				const dataId = interact.customId.includes(";")

				if (this.exists(interact.customId, dataId)) {
					this.invoke(interact.customId, interact, dataId)
				} else {
					this._logger.warn(`Invalid modal: ${interact.customId}`)
				}
			}
		})
	}
}
