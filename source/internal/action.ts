import Logger from "@jaxydog/clogts"
import { Client, Interaction } from "discord.js"
import { BaseStorage } from "./data"

export type ActionCallback<I extends Interaction> = (args: ActionArgs<I>) => Promise<void>

export interface ActionArgs<I extends Interaction> {
	readonly client: Client
	readonly interact: I
	readonly logger: Logger
	readonly storage: BaseStorage
	readonly data?: string
}

export abstract class ActionManager<I extends Interaction> {
	protected readonly _client: Client
	protected readonly _logger: Logger
	protected readonly _storage: BaseStorage
	protected readonly _list: Map<string, ActionCallback<I>> = new Map()

	public constructor(client: Client, logger: Logger, storage: BaseStorage) {
		this._client = client
		this._logger = logger
		this._storage = storage
		this._createListener()
	}

	protected abstract _createListener(): void

	public create(name: string, callback: ActionCallback<I>, dataId = false) {
		if (dataId) name = name.split(";")[0]!
		if (this.exists(name)) this.delete(name)
		this._list.set(name, callback)
		return this
	}
	public exists(name: string, dataId = false) {
		if (dataId) name = name.split(";")[0]!
		return this._list.has(name)
	}
	public delete(name: string, dataId = false) {
		if (dataId) name = name.split(";")[0]!
		return this._list.delete(name)
	}
	public async invoke(name: string, interact: I, dataId = false) {
		if (dataId) name = name.split(";")[0]!

		const args: ActionArgs<I> = {
			client: this._client,
			interact,
			logger: this._logger,
			storage: this._storage,
		}

		if (this.exists(name, dataId)) {
			try {
				const callback = this._list.get(name)!
				await callback(args)
				this._logger.info(`Invoked action: ${name}`)
			} catch (error) {
				this._logger.error(`Error invoking action: ${name}\n\t${error}`)
			}
		} else {
			this._logger.warn(`Missing action implementation: ${name}`)
		}
	}
}
export abstract class DefinedActionManager<I extends Interaction, D> extends ActionManager<I> {
	protected _data: Map<string, D> = new Map()

	public define(name: string, data: D, dataId = false) {
		if (dataId) name = name.split(";")[0]!
		if (this._data.has(name)) this._data.delete(name)
		this._data.set(name, data)
		return this
	}
	public struct(name: string, dataId = false) {
		if (dataId) name = name.split(";")[0]!
		return this._data.get(name)
	}

	public override create(name: string, callback: ActionCallback<I>, dataId = false) {
		if (dataId) name = name.split(";")[0]!
		if (this._data.has(name)) {
			super.create(name, callback)
		} else {
			throw `Missing struct data for ${name}`
		}
		return this
	}
}
