import { MessageButton, MessageButtonStyleResolvable } from "discord.js"

export class ButtonBuilder {
	private __button: MessageButton = new MessageButton()

	public id(id: string) {
		this.__button.setCustomId(id)
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
	public build() {
		return this.__button
	}
}
