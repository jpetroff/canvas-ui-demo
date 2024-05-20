import type { TCanvasContainerElement } from "./container"

export const enum LAYOUT_RULE {
	css = 'css'
}

export interface ILayoutOptions {
	moduleSize?: number
	layout?: LAYOUT_RULE
	moduleGap?: number
	normalizeWidth?: boolean
	normalizeHeight?: boolean
	minW?: number
	minH?: number
	maxW?: number
	maxH?: number
	columns?: number
}

export type TContainerCoordCollection = {
	[key: string]: ICanvasContainerCoords
}

export type TContainerList = (HTMLElement & TCanvasContainerElement)[]

export type TConnectorDescription = {
	from: string,
	to: string
}
export type TConnectorDescriptionList = Array<TConnectorDescription>

export enum ConnectorAttachmentType {
	top = 't',
	bottom = 'b',
	left = 'l',
	right = 'r',
	topLeft = 'tl',
	topRight = 'tr',
	bottomLeft = 'bl',
	bottomRight = 'br'
}

export type TConnectorPoint = {
	x: number,
	y: number,
	vector: ConnectorAttachmentType
}

export type TDefinedConnectorCoords = {
	start: TConnectorPoint,
	end: TConnectorPoint,
	top: number,
	left: number,
	w: number, 
	h: number
} & TConnectorDescription

export type TDefinedConnectorList = Array<TDefinedConnectorCoords>
