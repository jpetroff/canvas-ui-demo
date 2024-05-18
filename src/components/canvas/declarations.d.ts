declare interface ICanvasRect {
	height: number
	width: number
}

declare interface ICanvasContainerCoords extends ICanvasRect {
	moduleX?: number
	moduleY?: number
	moduleW?: number
	moduleH?: number
	key: string
	index: number
	parentOffset: {
		x: number,
		y: number
	}
	boundTo?: string
	isAbsolute?: boolean
	connectTo?: string
}

