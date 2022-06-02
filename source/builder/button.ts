import { MessageButton, MessageButtonStyleResolvable } from "discord.js"

export class ButtonBuilder {
	private __button: MessageButton = new MessageButton()

	public setId(id: string) {
		this.__button.setCustomId(id)
		return this
	}
	public setLabel(label: string) {
		this.__button.setLabel(label)
		return this
	}
	public setEmoji(emoji: string) {
		this.__button.setEmoji(emoji)
		return this
	}
	public setStyle(style: MessageButtonStyleResolvable) {
		this.__button.setStyle(style)
		return this
	}
	public setUrl(url: string) {
		this.__button.setURL(url)
		return this
	}
}
