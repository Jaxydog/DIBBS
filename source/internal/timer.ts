import Logger from "@jaxydog/clogts"
import { Client } from "discord.js"
import { BaseStorage } from "./data"

async function autoCatch<T>(promise: Promise<T>) {
	try {
		return { result: true, content: await promise }
	} catch (error) {
		return { result: false, content: null }
	}
}

export type Callback = (args: Args) => Promise<void>

export interface Args {
	readonly client: Client
	readonly logger: Logger
	readonly storage: BaseStorage
}

export class Timer {
	protected readonly _client: Client
	protected readonly _logger: Logger
	protected readonly _storage: BaseStorage
	private __list: Map<symbol, Callback> = new Map()
	private __interval?: NodeJS.Timer

	public constructor(client: Client, logger: Logger, storage: BaseStorage) {
		this._client = client
		this._logger = logger
		this._storage = storage
	}

	public start(seconds: number) {
		this.cancel()
		this.__interval = setInterval(this.invoke, seconds * 1000)
	}
	public cancel() {
		clearInterval(this.__interval)
	}
	public queue(callback: Callback) {
		const id = Symbol()
		this.__list.set(id, callback)
		return id
	}
	public invoke() {
		for (const callback of this.__list.values()) {
			autoCatch(
				callback({
					client: this._client,
					logger: this._logger,
					storage: this._storage,
				})
			)
		}
	}
}
