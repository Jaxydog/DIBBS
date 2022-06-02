import { MessageActionRow, MessageActionRowComponentResolvable } from "discord.js"

export class ComponentBuilder {
	private __list: MessageActionRowComponentResolvable[] = []

	public get components() {
		return this.__list.length
	}
	public get rows() {
		return this.build().length
	}

	public add(...components: MessageActionRowComponentResolvable[]) {
		this.__list.push(...components)
		return this
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
