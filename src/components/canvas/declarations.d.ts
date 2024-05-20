// import type { TCanvasContainerElement } from "./container"
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
		isAbsolute?: boolean
		canBeBound?: boolean
		boundToContainer?: string
	}

declare type TContainerDescriptorPropItem = {
	isExtra?: boolean
	canBeBound?: boolean
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