import { MessageActionRow, MessageActionRowComponentResolvable } from "discord.js"

export class ComponentBuilder {
	private __list: MessageActionRowComponentResolvable[] = []

	public get components() {
		return this.__list.length
	}
	public get rows() {
		return this.build().length
	}

	public static from(...rows: MessageActionRowComponentResolvable[]) {
		const builder = new ComponentBuilder()
		builder.__list = rows
		return builder
	}

	public component(component: MessageActionRowComponentResolvable) {
		this.__list ??= []
		this.__list.push(component)
		return this
	}
	public clone() {
		return ComponentBuilder.from(...this.__list)
	}
	public build(): MessageActionRow[] {
		const rows: MessageActionRow[] = []
		let current = new MessageActionRow()

		for (const item of this.__list) {
			current.addComponents(item)

			if (current.components.length === 5) {
				rows.push(current)
				current = new MessageActionRow()
			}
		}

		if (current.components.length !== 0) {
			rows.push(current)
		}

		return rows
	}
}
