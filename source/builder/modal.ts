import {
	MessageActionRow,
	Modal,
	ModalActionRowComponent,
	TextInputComponent,
	TextInputStyleResolvable,
} from "discord.js"

export class ModalBuilder {
	private __modal: Modal = new Modal()
	private __rows: MessageActionRow<ModalActionRowComponent>[] = []

	public static from(modal: Modal, ...rows: MessageActionRow<ModalActionRowComponent>[]) {
		const builder = new ModalBuilder()
		builder.__modal = modal
		builder.__rows = rows.slice(0, 4)
		return builder
	}

	public id(id: string) {
		this.__modal.setCustomId(id)
		return this
	}
	public dataId(id: string, data: string) {
		this.__modal.setCustomId(`${id};${data}`)
		return this
	}
	public title(title: string) {
		this.__modal.setTitle(title)
		return this
	}
	public field(field: ModalActionRowComponent) {
		if (this.__rows.length < 5) {
			const row = new MessageActionRow<ModalActionRowComponent>().addComponents(field)
			this.__rows.push(row)
		}
		return this
	}
	public clone() {
		return ModalBuilder.from(this.__modal, ...this.__rows)
	}
	public build() {
		this.__modal.addComponents(...this.__rows)
		return this.__modal
	}
}
export class ModalFieldBuilder {
	private __field = new TextInputComponent()

	public static from(field: TextInputComponent) {
		const builder = new ModalFieldBuilder()
		builder.__field = field
		return builder
	}

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
	public clone() {
		return ModalFieldBuilder.from(this.__field)
	}
	public build() {
		return this.__field
	}
}
