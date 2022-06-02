import { MessageActionRow, Modal, ModalActionRowComponent, ModalActionRowComponentResolvable } from "discord.js"

export class ModalBuilder {
	private __modal: Modal = new Modal()

	public setId(id: string) {
		this.__modal.setCustomId(id)
		return this
	}
	public setTitle(title: string) {
		this.__modal.setTitle(title)
		return this
	}
	public setComponents(...components: ModalActionRowComponentResolvable[]) {
		const row = new MessageActionRow<ModalActionRowComponent>().setComponents(...components.slice(0, 5))
		this.__modal.setComponents(row)
		return this.__modal
	}
	public build() {
		return this.__modal
	}
}
