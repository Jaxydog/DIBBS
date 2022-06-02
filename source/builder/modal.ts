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

	public setId(id: string) {
		this.__modal.setCustomId(id)
		return this
	}
	public setTitle(title: string) {
		this.__modal.setTitle(title)
		return this
	}
	public addField(field: ModalFieldBuilder) {
		if (this.__row.components.length < 5) {
			this.__row.addComponents(field.build())
		}
		return this.__modal
	}
	public build() {
		return this.__modal
	}
}
export class ModalFieldBuilder {
	private __field = new TextInputComponent()

	public setId(id: string) {
		this.__field.setCustomId(id)
		return this
	}
	public setTitle(title: string) {
		this.__field.setLabel(title)
		return this
	}
	public setStyle(style: TextInputStyleResolvable) {
		this.__field.setStyle(style)
		return this
	}
	public setBounds(min: number, max: number) {
		this.__field.setMinLength(min)
		this.__field.setMaxLength(max)
		return this
	}
	public setPlaceholder(placeholder: string) {
		this.__field.setPlaceholder(placeholder)
		return this
	}
	public setDefault(value: string) {
		this.__field.setValue(value)
		return this
	}
	public setRequired(required = true) {
		this.__field.setRequired(required)
		return this
	}
	public build() {
		return this.__field
	}
}
