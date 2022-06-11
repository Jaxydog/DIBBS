import { MessageButton, MessageButtonStyleResolvable } from "discord.js"

export class ButtonBuilder {
	private __button: MessageButton = new MessageButton()

	public static from(button: MessageButton) {
		const builder = new ButtonBuilder()
		builder.__button = button
		return builder
	}

	public id(id: string) {
		this.__button.setCustomId(id)
		return this
	}
	public dataId(id: string, data: string) {
		this.__button.setCustomId(`${id};${data}`)
		return this
	}
	public label(label: string) {
		this.__button.setLabel(label)
		return this
	}
	public emoji(emoji: string) {
		this.__button.setEmoji(emoji)
		return this
	}
	public style(style: MessageButtonStyleResolvable) {
		this.__button.setStyle(style)
		return this
	}
	public url(url: string) {
		this.__button.setURL(url)
		return this
	}
	public clone() {
		return ButtonBuilder.from(this.__button)
	}
	public build() {
		return this.__button
	}
}
