import { ColorResolvable, EmbedFieldData, MessageEmbed } from "discord.js"

export class EmbedBuilder {
	private __embed = new MessageEmbed()

	public static from(embed: MessageEmbed) {
		const builder = new EmbedBuilder()
		builder.__embed = embed
		return builder
	}

	public author(name: string, iconURL?: string, url?: string) {
		this.__embed.setAuthor({ name, iconURL, url })
		return this
	}
	public title(title: string) {
		this.__embed.setTitle(title)
		return this
	}
	public description(description: string) {
		this.__embed.setDescription(description)
		return this
	}
	public fields(...fields: EmbedFieldData[] | EmbedFieldData[][]) {
		this.__embed.addFields(...fields)
		return this
	}
	public image(url: string) {
		this.__embed.setImage(url)
		return this
	}
	public thumbnail(url: string) {
		this.__embed.setThumbnail(url)
		return this
	}
	public footer(text: string, iconURL?: string) {
		this.__embed.setFooter({ text, iconURL })
		return this
	}
	public color(color: ColorResolvable) {
		this.__embed.setColor(color)
		return this
	}
	public timestamp(time: number | Date) {
		this.__embed.setTimestamp(time)
		return this
	}
	public url(url: string) {
		this.__embed.setURL(url)
		return this
	}
	public clone() {
		return EmbedBuilder.from(this.__embed)
	}
	public build() {
		return this.__embed
	}
}
