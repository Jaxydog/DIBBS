import {
	MessageActionRow,
	Modal,
	ModalActionRowComponent,
	TextInputComponent,
	TextInputStyleResolvable,
} from "discord.js"

export class ModalBuilder {
	private __modal: Modal = new Modal()
	private __row = new MessageActionRow<ModalActionRowComponent>()

	public id(id: string) {
		this.__modal.setCustomId(id)
		return this
	}
	public title(title: string) {
		this.__modal.setTitle(title)
		return this
	}
	public field(field: ModalFieldBuilder) {
		if (this.__row.components.length < 5) {
			this.__row.addComponents(field.build())
		}
		return this
	}
	public build() {
		return this.__modal
	}
}
export class ModalFieldBuilder {
	private __field = new TextInputComponent()

	public id(id: string) {
		this.__field.setCustomId(id)
		return this
	}
	public title(title: string) {
		this.__field.setLabel(title)
		return this
	}
	public style(style: TextInputStyleResolvable) {
		this.__field.setStyle(style)
		return this
	}
	public bounds(min: number, max: number) {
		this.__field.setMinLength(min)
		this.__field.setMaxLength(max)
		return this
	}
	public placeholder(placeholder: string) {
		this.__field.setPlaceholder(placeholder)
		return this
	}
	public default(value: string) {
		this.__field.setValue(value)
		return this
	}
	public required(required = true) {
		this.__field.setRequired(required)
		return this
	}
	public build() {
		return this.__field
	}
}
