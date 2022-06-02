import dayjs from "dayjs"
import Logger, { Level, Rule } from "@jaxydog/clogts"
import { BitFieldResolvable, Client as DiscordClient, IntentsString } from "discord.js"
import { ButtonManager, CommandManager, ModalManager } from "./utils/action"
import { DualStorage } from "./internal/data"
import { Timer } from "./internal/timer"

export * from "./builder/button"
export * from "./builder/component"
export * from "./builder/embed"
export * from "./builder/modal"

export class Client {
	private readonly __storage = new DualStorage()
	private readonly __baseTimer: Timer
	private readonly __buttonManager: ButtonManager
	private readonly __commandManager: CommandManager
	private readonly __modalManager: ModalManager
	protected readonly _logger = new Logger()
	protected readonly _client: DiscordClient
	protected readonly _token: string

	public constructor(intents: BitFieldResolvable<IntentsString, number>, token: string) {
		this._client = new DiscordClient({ intents })
		this._token = token

		this.__createLogger()

		this.__baseTimer = new Timer(this._client, this._logger, this.__storage)
		this.__buttonManager = new ButtonManager(this._client, this._logger, this.__storage)
		this.__commandManager = new CommandManager(this._client, this._logger, this.__storage)
		this.__modalManager = new ModalManager(this._client, this._logger, this.__storage)
	}

	public get buttons() {
		return this.__buttonManager
	}
	public get commands() {
		return this.__commandManager
	}
	public get modals() {
		return this.__modalManager
	}
	public get storage() {
		return this.__storage
	}
	public get timer() {
		return this.__baseTimer
	}

	private __createLogger() {
		this._logger.colors.create("main-i", "blue-bright")
		this._logger.colors.create("main-w", "yellow-bright")
		this._logger.colors.create("main-e", "red-bright")
		this._logger.props.create(
			Level.Info,
			() => `[${dayjs().format("DD/MM/YY HH:mm:ss:SSS ZZ")}]`,
			new Rule(/.+/, "main-i")
		)
		this._logger.props.create(
			Level.Warn,
			() => `[${dayjs().format("DD/MM/YY HH:mm:ss:SSS ZZ")}]`,
			new Rule(/.+/, "main-w")
		)
		this._logger.props.create(
			Level.Error,
			() => `[${dayjs().format("DD/MM/YY HH:mm:ss:SSS ZZ")}]`,
			new Rule(/.+/, "main-e")
		)
	}
	public async connect() {
		this._client.once("ready", async () => {
			this._logger.info(`Connected client (${this._client.user!.tag})`)
		})
		await this._client.login(this._token)
	}
}
