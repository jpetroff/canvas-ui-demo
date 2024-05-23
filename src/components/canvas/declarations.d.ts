// import type { TCanvasContainerElement } from "./container"
declare type TRoundedCoords = { top: number, bottom: number, left: number, right: number}

declare type DOMRectMutable = {
	top: number
	right: number
	bottom: number
	left: number
	width: number
	height: number
	x: number
	y: number
}

declare type TRect = {
	// absolute coordinates from getBoundingClientRect()
	left: number
	top: number

	// absolute values from getBoundingClientRect()
	width: number
	height: number
}

declare type TContainerRect = 
	TRect & {
		key: string
		index: number
		isAbsolute: boolean
		sticky?: boolean
		boundToContainer?: string
		atScale: number
		parent?: {
			left: number,
			top: number
		}
	}

declare type TContainerDescriptorPropItem = {
	isExtra?: boolean
	sticky?: boolean
	boundToContainer?: string
	// relative values stored by client
	relative?: {
		left: number,
		top: number
	}
}

declare interface IContainerDescriptorPropCollection {
	[key: string]: TContainerDescriptorPropItem
}

declare type TContainerDescriptor = 
	TContainerRect & 
	ContainerDescriptorPropItem

declare type TContainerDescriptorCollection = {
	[key: string]: TContainerDescriptor
}

declare type TContainerList = (HTMLElement & TCanvasContainerElement)[]

declare type TConnectorPath = {
	from: string,
	to: string
}
type TConnectorPathList = TConnectorPath[]

declare type TConnectorPoint = {
	x: number,
	y: number,
	vector: ConnectorAttachmentType
}

declare type TConnectorDescriptor = 
	TConnectorPath &
	{
		start: TConnectorPoint,
		end: TConnectorPoint,
		top: number,
		left: number,
		w: number, 
		h: number
	}

declare type TConnectorDescriptorList = TConnectorDescriptor[]

