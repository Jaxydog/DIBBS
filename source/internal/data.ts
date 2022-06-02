import { Awaitable } from "discord.js"
import FS from "fs/promises"

export type Action<T> = (data: T, id: string, storage: BaseStorage) => Awaitable<void>
export type Modifier<T> = (data: T, id: string, storage: BaseStorage) => Awaitable<T>
export type Predicate<T> = (data: T, id: string, storage: BaseStorage) => Awaitable<boolean>

async function autoCatch<T>(promise: Promise<T>) {
	try {
		return { result: true, content: await promise }
	} catch (error) {
		return { result: false, content: null }
	}
}

export abstract class BaseStorage {
	private static readonly __root = "./data"

	protected _idToPath(id: string) {
		if (id.startsWith("/")) id = id.slice(1)
		return `${BaseStorage.__root}/${id}.json`
	}
	protected _dirToPath(dir: string) {
		if (dir.startsWith("/")) dir = dir.slice(1)
		if (!dir.endsWith("/")) dir += "/"
		return `${BaseStorage.__root}/${dir}`
	}
	protected _pathToId(path: string) {
		return path.slice(BaseStorage.__root.length, path.length - (5 + BaseStorage.__root.length))
	}
	protected _pathToDir(path: string) {
		return path.slice(BaseStorage.__root.length)
	}

	public abstract has(id: string): Awaitable<boolean>
	public abstract get<T>(id: string): Awaitable<T | undefined>
	public abstract set<T>(id: string, data: T): Awaitable<boolean>
	public abstract dir(dir: string): Awaitable<string[]>
	public abstract del(id: string): Awaitable<boolean>

	public async expect<T>(id: string, pred: Predicate<T>) {
		return (await this.has(id)) && (await pred((await this.get(id))!, id, this))
	}
	public async expectAll<T>(dir: string, pred: Predicate<T>) {
		return (await this.dir(dir)).map((id) => this.expect(id, pred)).every(async (p) => await p)
	}
	public async expectSome<T>(dir: string, pred: Predicate<T>) {
		return (await this.dir(dir)).map((id) => this.expect(id, pred)).some(async (p) => await p)
	}

	public async action<T>(id: string, act: Action<T>) {
		if (await this.has(id)) {
			await act((await this.get(id))!, id, this)
		}
	}
	public async actionIf<T>(id: string, pred: Predicate<T>, act: Action<T>) {
		if (await this.expect(id, pred)) {
			await act((await this.get(id))!, id, this)
		}
	}
	public async actionAll<T>(dir: string, act: Action<T>) {
		for (const id of await this.dir(dir)) {
			await this.action(id, act)
		}
	}
	public async actionAllIf<T>(dir: string, pred: Predicate<T>, act: Action<T>) {
		for (const id of await this.dir(dir)) {
			await this.actionIf(id, pred, act)
		}
	}

	public async modify<T>(id: string, mod: Modifier<T>) {
		return (await this.has(id)) && (await this.set(id, await mod((await this.get(id))!, id, this)))
	}
	public async modifyIf<T>(id: string, pred: Predicate<T>, mod: Modifier<T>) {
		return (await this.expect(id, pred)) && this.modify(id, mod)
	}
	public async modifyAll<T>(dir: string, mod: Modifier<T>) {
		return (await this.dir(dir)).map((id) => this.modify(id, mod)).every(async (p) => await p)
	}
	public async modifyAllIf<T>(dir: string, pred: Predicate<T>, mod: Modifier<T>) {
		return (await this.dir(dir)).map((id) => this.modifyIf(id, pred, mod)).every(async (p) => await p)
	}
}
export class CacheStorage extends BaseStorage {
	private readonly __cache: Map<string, unknown> = new Map()

	public has(id: string) {
		return this.__cache.has(this._idToPath(id))
	}
	public get<T>(id: string) {
		return this.__cache.get(this._idToPath(id)) as T | undefined
	}
	public set<T>(id: string, data: T) {
		return this.__cache.set(this._idToPath(id), data).has(this._idToPath(id))
	}
	public dir(dir: string) {
		return [...this.__cache.keys()].map(this._pathToId).filter((id) => id.startsWith(dir))
	}
	public del(id: string) {
		return this.__cache.delete(this._idToPath(id))
	}
}
export class FileStorage extends BaseStorage {
	public async has(id: string) {
		return (await autoCatch(FS.readFile(this._idToPath(id)))).result
	}
	public async get<T>(id: string) {
		const { result, content } = await autoCatch(FS.readFile(this._idToPath(id), { encoding: "utf8" }))
		if (result) return JSON.parse(content!) as T
	}
	public async set<T>(id: string, data: T) {
		const raw = JSON.stringify(data, null, "\t")
		return (await autoCatch(FS.writeFile(this._idToPath(id), raw, { encoding: "utf8" }))).result
	}
	public async dir(dir: string) {
		const { result, content } = await autoCatch(FS.readdir(this._dirToPath(dir), { withFileTypes: true }))
		return result ? content!.filter((d) => d.isFile()).map((d) => this._pathToId(d.name)) : []
	}
	public async del(id: string) {
		return (await autoCatch(FS.rm(this._idToPath(id)))).result
	}
}
export class DualStorage extends BaseStorage {
	private __cache = new CacheStorage()
	private __file = new FileStorage()

	public async has(id: string) {
		return this.__cache.has(id) && (await this.__file.has(id))
	}
	public async get<T>(id: string) {
		return this.__cache.has(id) ? this.__cache.get<T>(id) : await this.__file.get<T>(id)
	}
	public async set<T>(id: string, data: T) {
		return this.__cache.set<T>(id, data) && (await this.__file.set<T>(id, data))
	}
	public async dir(dir: string) {
		return this.__cache.dir(dir).concat(...(await this.__file.dir(dir)))
	}
	public async del(id: string) {
		return this.__cache.del(id) && (await this.__file.del(id))
	}
}