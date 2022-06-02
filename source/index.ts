import dayjs from "dayjs"
import Logger, { Level, Rule } from "@jaxydog/clogts"
import {
	ActivityOptions,
	BitFieldResolvable,
	Client as DiscordClient,
	ClientEvents,
	IntentsString,
	PresenceStatusData,
} from "discord.js"
import { ButtonManager, CommandManager, ModalManager } from "./utils/action"
import { CacheStorage, DualStorage } from "./internal/data"
import { Timer } from "./internal/timer"

export * from "./builder/button"
export * from "./builder/component"
export * from "./builder/embed"
export * from "./builder/modal"

export interface Config {
	commandGuildId: string
	intents: BitFieldResolvable<IntentsString, number>
	timerIntervalSeconds?: number
	token: string
	updateGlobalCommands?: boolean
}

export class Client {
	private readonly __storage = new DualStorage()
	private readonly __baseTimer: Timer
	private readonly __buttonManager: ButtonManager
	private readonly __commandManager: CommandManager
	private readonly __modalManager: ModalManager
	protected readonly _localStorage = new CacheStorage()
	protected readonly _logger = new Logger()
	protected readonly _client: DiscordClient

	public constructor(config: Config) {
		this._client = new DiscordClient({ intents: config.intents })
		this.__createLogger()

		this._localStorage.set("token", config.token)
		this._localStorage.set("cmd_guild", config.commandGuildId)
		this._localStorage.set("cmd_global", config.updateGlobalCommands ?? false)
		this._localStorage.set("timer_interval", config.timerIntervalSeconds ?? 30)

		this.__baseTimer = new Timer(this._client, this._logger, this.__storage)
		this.__buttonManager = new ButtonManager(this._client, this._logger, this.__storage)
		this.__commandManager = new CommandManager(this._client, this._logger, this.__storage)
		this.__modalManager = new ModalManager(this._client, this._logger, this.__storage)
	}

	public get buttons() {
		return this.__buttonManager
	}
	public get client() {
		return this._client
	}
	public get commands() {
		return this.__commandManager
	}
	public get logger() {
		return this._logger
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
		this._logger.store = false
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

			await this.commands.update(
				this._localStorage.get("token")!,
				this._localStorage.get("cmd_guild")!,
				this._localStorage.get("cmd_global")!
			)
		})

		this.timer.queue(async ({ logger }) => {
			logger.info(`Invoked timer callbacks`)
		})

		await this._client.login(this._localStorage.get("token")!)
		this._localStorage.set("timer_tick", Date.now())
		this.timer.start(this._localStorage.get("timer_interval")!)
	}
	public setStatus(status: PresenceStatusData) {
		if (this._localStorage.has("status_id")) {
			this.timer.remove(this._localStorage.get("status_id")!)
		}

		this._localStorage.set("status_val", status)

		const timerId = this.timer.queue(async ({ client }) => {
			if (client.user?.presence.status !== status) {
				client.user?.setStatus(this._localStorage.get("status_val") ?? "online")
			}
		})

		this._localStorage.set("status_id", timerId)
	}
	public setActivity(activity: ActivityOptions) {
		if (this._localStorage.has("activity_id")) {
			this.timer.remove(this._localStorage.get("activity_id")!)
		}

		this._localStorage.set("activity_val", activity)

		const timerId = this.timer.queue(async ({ client }) => {
			if (client.user?.presence.activities[0] !== activity) {
				client.user?.setActivity(this._localStorage.get("activity_val"))
			}
		})

		this._localStorage.set("activity_id", timerId)
	}
	public onEvent<E extends keyof ClientEvents>(event: E, callback: (...args: ClientEvents[E]) => Promise<void>) {
		if (this._localStorage.has(`event_${event}_callback`)) {
			this._client.off(event, this._localStorage.get(`event_${event}_callback`)!)
		}

		this._client.on(event, callback)
		this._localStorage.set(`event_${event}_callback`, callback)
	}
	public offEvent(event: keyof ClientEvents) {
		if (this._localStorage.has(`event_${event}_callback`)) {
			this._client.off(event, this._localStorage.get(`event_${event}_callback`)!)
			this._localStorage.del(`event_${event}_callback`)
		}
	}
}
