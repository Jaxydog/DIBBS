import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v10"
import {
	ApplicationCommandDataResolvable,
	ButtonInteraction,
	CommandInteraction,
	ModalSubmitInteraction,
} from "discord.js"
import { ButtonBuilder } from "../builder/button"
import { ModalBuilder } from "../builder/modal"
import { DefinedActionManager } from "../internal/action"

export class ButtonManager extends DefinedActionManager<ButtonInteraction, ButtonBuilder> {
	protected _createListener() {
		this._client.on("interactionCreate", (interact) => {
			if (interact.isButton() && this.exists(interact.customId)) {
				this.invoke(interact.customId, interact)
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
			this._logger.warn(`Unable to refresh commands: ${error}`)
		}
	}
}
export class ModalManager extends DefinedActionManager<ModalSubmitInteraction, ModalBuilder> {
	protected _createListener() {
		this._client.on("interactionCreate", (interact) => {
			if (interact.isModalSubmit() && this.exists(interact.customId)) {
				this.invoke(interact.customId, interact)
			}
		})
	}
}