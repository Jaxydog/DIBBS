import { Awaitable } from "discord.js"
import FS from "fs/promises"

export type Action<T> = (data: T, id: string, ext: string, storage: BaseStorage) => Awaitable<void>
export type Modifier<T> = (data: T, id: string, ext: string, storage: BaseStorage) => Awaitable<T>
export type Predicate<T> = (data: T, id: string, ext: string, storage: BaseStorage) => Awaitable<boolean>

async function autoCatch<T>(
	promise: Promise<T>
): Promise<{ result: true; content: T } | { result: false; content: null }> {
	try {
		return { result: true, content: await promise }
	} catch (error) {
		return { result: false, content: null }
	}
}

export abstract class BaseStorage {
	public static readonly defaultExt = "json"
	private static readonly __root = "./data"

	protected _idToPath(id: string, ext = BaseStorage.defaultExt) {
		if (id.startsWith("/")) id = id.slice(1)
		return `${BaseStorage.__root}/${id}.${ext}`
	}
	protected _dirToPath(dir: string) {
		if (dir.startsWith("/")) dir = dir.slice(1)
		if (!dir.endsWith("/")) dir += "/"
		return `${BaseStorage.__root}/${dir}`
	}
	protected _pathToId(dir: string, path: string, ext = BaseStorage.defaultExt) {
		if (dir.startsWith("/")) dir = dir.slice(1)
		if (!dir.endsWith("/")) dir += "/"
		return `${dir}${path.slice(0, path.lastIndexOf(`.${ext}`))}`
	}

	public abstract has(id: string, ext?: string): Awaitable<boolean>
	public abstract get<T>(id: string, ext?: string): Awaitable<T | undefined>
	public abstract set<T>(id: string, data: T, ext?: string): Awaitable<boolean>
	public abstract dir(dir: string): Awaitable<string[]>
	public abstract del(id: string, ext?: string): Awaitable<boolean>

	public async expect<T>(id: string, pred: Predicate<T>, ext = BaseStorage.defaultExt) {
		return (await this.has(id, ext)) && (await pred((await this.get(id, ext))!, id, ext, this))
	}
	public async expectAll<T>(dir: string, pred: Predicate<T>, ext = BaseStorage.defaultExt) {
		return (await this.dir(dir)).map((id) => this.expect(id, pred, ext)).every(async (p) => await p)
	}
	public async expectSome<T>(dir: string, pred: Predicate<T>, ext = BaseStorage.defaultExt) {
		return (await this.dir(dir)).map((id) => this.expect(id, pred, ext)).some(async (p) => await p)
	}

	public async action<T>(id: string, act: Action<T>, ext = BaseStorage.defaultExt) {
		if (await this.has(id, ext)) {
			await act((await this.get(id, ext))!, id, ext, this)
		}
	}
	public async actionIf<T>(id: string, pred: Predicate<T>, act: Action<T>, ext = BaseStorage.defaultExt) {
		if (await this.expect(id, pred, ext)) {
			await act((await this.get(id, ext))!, id, ext, this)
		}
	}
	public async actionAll<T>(dir: string, act: Action<T>, ext = BaseStorage.defaultExt) {
		for (const id of await this.dir(dir)) {
			await this.action(id, act, ext)
		}
	}
	public async actionAllIf<T>(dir: string, pred: Predicate<T>, act: Action<T>, ext = BaseStorage.defaultExt) {
		for (const id of await this.dir(dir)) {
			await this.actionIf(id, pred, act, ext)
		}
	}

	public async modify<T>(id: string, mod: Modifier<T>, ext = BaseStorage.defaultExt) {
		return (
			(await this.has(id, ext)) && (await this.set(id, await mod((await this.get(id, ext))!, id, ext, this), ext))
		)
	}
	public async modifyIf<T>(id: string, pred: Predicate<T>, mod: Modifier<T>, ext = BaseStorage.defaultExt) {
		return (await this.expect(id, pred, ext)) && this.modify(id, mod, ext)
	}
	public async modifyAll<T>(dir: string, mod: Modifier<T>, ext = BaseStorage.defaultExt) {
		return (await this.dir(dir)).map((id) => this.modify(id, mod, ext)).every(async (p) => await p)
	}
	public async modifyAllIf<T>(dir: string, pred: Predicate<T>, mod: Modifier<T>, ext = BaseStorage.defaultExt) {
		return (await this.dir(dir)).map((id) => this.modifyIf(id, pred, mod, ext)).every(async (p) => await p)
	}
}
export class CacheStorage extends BaseStorage {
	private readonly __cache: Map<string, unknown> = new Map()

	public has(id: string, ext = BaseStorage.defaultExt) {
		const path = this._idToPath(id, ext)
		return this.__cache.has(path)
	}
	public get<T>(id: string, ext = BaseStorage.defaultExt) {
		const path = this._idToPath(id, ext)
		return this.__cache.get(path) as T | undefined
	}
	public set<T>(id: string, data: T, ext = BaseStorage.defaultExt) {
		const path = this._idToPath(id, ext)
		return this.__cache.set(path, data).has(path)
	}
	public dir(dir: string, ext = BaseStorage.defaultExt) {
		const path = this._dirToPath(dir)
		return [...this.__cache.keys()].map((id) => this._pathToId(dir, id, ext)).filter((id) => id.startsWith(path))
	}
	public del(id: string, ext = BaseStorage.defaultExt) {
		const path = this._idToPath(id, ext)
		return this.__cache.delete(path)
	}
}
export class FileStorage extends BaseStorage {
	public async has(id: string, ext = BaseStorage.defaultExt) {
		const path = this._idToPath(id, ext)
		return (await autoCatch(FS.readFile(path))).result
	}
	public async get<T>(id: string, ext = BaseStorage.defaultExt) {
		const path = this._idToPath(id, ext)
		const { result, content } = await autoCatch(FS.readFile(path, { encoding: "utf8" }))
		if (result) return JSON.parse(content!) as T
	}
	public async set<T>(id: string, data: T, ext = BaseStorage.defaultExt) {
		const path = this._idToPath(id, ext)
		const raw = JSON.stringify(data, null, "\t")
		await autoCatch(FS.mkdir(path.slice(0, path.lastIndexOf("/"))))
		return (await autoCatch(FS.writeFile(path, raw, { encoding: "utf8" }))).result
	}
	public async dir(dir: string, ext = BaseStorage.defaultExt) {
		const path = this._dirToPath(dir)
		const { result, content } = await autoCatch(FS.readdir(path, { withFileTypes: true }))
		return result ? content!.filter((d) => d.isFile()).map((d) => this._pathToId(dir, d.name, ext)) : []
	}
	public async del(id: string, ext = BaseStorage.defaultExt) {
		const path = this._idToPath(id, ext)
		return (await autoCatch(FS.rm(path))).result
	}
}
export class DualStorage extends BaseStorage {
	private __cache = new CacheStorage()
	private __file = new FileStorage()

	public async has(id: string, ext = BaseStorage.defaultExt) {
		return this.__cache.has(id, ext) || (await this.__file.has(id, ext))
	}
	public async get<T>(id: string, ext = BaseStorage.defaultExt) {
		return this.__cache.has(id, ext) ? this.__cache.get<T>(id, ext) : await this.__file.get<T>(id, ext)
	}
	public async set<T>(id: string, data: T, ext = BaseStorage.defaultExt) {
		return this.__cache.set<T>(id, data, ext) && (await this.__file.set<T>(id, data, ext))
	}
	public async dir(dir: string, ext = BaseStorage.defaultExt) {
		return [...new Set([...this.__cache.dir(dir, ext), ...(await this.__file.dir(dir, ext))]).values()]
	}
	public async del(id: string, ext = BaseStorage.defaultExt) {
		return this.__cache.del(id, ext) && (await this.__file.del(id, ext))
	}
}
