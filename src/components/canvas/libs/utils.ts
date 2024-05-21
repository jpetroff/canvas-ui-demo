import { each, filter, indexOf, uniqBy } from "lodash"
import { ConnectorAttachmentType } from "../Connector"


export type TRoundedCoords = { top: number, bottom: number, left: number, right: number}

/* 
	Coordinate manupulation and graphic utils
*/
export const _r = Math.round

export const _f = Math.floor

export const _c = Math.ceil

export const getAttachmentType =  (
	x: number,
	y: number,
	{ top, bottom, left, right }: TRoundedCoords
) : ConnectorAttachmentType => {

	if( epsEqual(y, top) && epsEqual(x, left) ) return ConnectorAttachmentType.topLeft
	if( epsEqual(y, bottom) && epsEqual(x, left) ) return ConnectorAttachmentType.bottomLeft
	if( epsEqual(y, top) && epsEqual(x, right) ) return ConnectorAttachmentType.topRight
	if( epsEqual(y, bottom) && epsEqual(x, right) ) return ConnectorAttachmentType.bottomRight

	if( epsEqual(y, top) ) return ConnectorAttachmentType.top
	if( epsEqual(y, bottom) ) return ConnectorAttachmentType.bottom
	if( epsEqual(x, left) ) return ConnectorAttachmentType.left
	if( epsEqual(x, right) ) return ConnectorAttachmentType.right

	return ConnectorAttachmentType.top
}

export const getRoundedCoords = (
	rectDom: DOMRect, 
	offset: { x: number, y: number } = { x: 0, y: 0}
) : TRoundedCoords => {
	return {
		top: _r(rectDom.top - offset.y),
		bottom: _r(rectDom.top + rectDom.height - offset.y),
		left: _r(rectDom.left - offset.x),
		right: _r(rectDom.left + rectDom.width - offset.x)
	}
}

export const calcConnectorPoints = (
	{ top, bottom, left, right }: TRoundedCoords
) : TConnectorPoint[] => {
	let result : TConnectorPoint[] = []
	const halfW = Math.floor((right - left) / 2)
	const halfH = Math.floor((bottom - top) / 2)

	for(let x = left; x <= (left+2*halfW); x = x + halfW ) {
		for(let y = top; y <= (top+2*halfH); y = y + halfH ) {
			if( epsEqual(x, left + halfW) && epsEqual(y, top + halfH) ) continue
			
			result.push({
				x,
				y,
				vector: getAttachmentType(x, y, { top, bottom, left, right })
			})
		}
	}

	return result
}

export const findClosestPoints = (
	from: TConnectorPoint[],
	to: TConnectorPoint[],
) => {
	let minLength = Number.MAX_SAFE_INTEGER
	let result = {
		from: null,
		to: null
	}

	each(from, (fromPoint) => {
		each(to, (toPoint) => {
			const X = toPoint.x - fromPoint.x
			const Y = toPoint.y - fromPoint.y
			const l = Math.sqrt( X*X + Y*Y )
			if(l < minLength) {
				minLength = l
				result.from = fromPoint,
				result.to = toPoint
			}
		})
	})

	return result
}

export const isPointInside = (x: number, y: number, rect: TRoundedCoords) : boolean => {
	return (
		( x >= rect.left && x <= rect.right ) &&
		( y >= rect.top && y <= rect.bottom )
	)
}

export const filterOverlappingPoints = ( 
	rect: TRoundedCoords, points: TConnectorPoint[] 
) : TConnectorPoint[] => {
	let result : TConnectorPoint[] = []

	each(points, (point) => {
		if(
			!isPointInside(point.x, point.y, rect)
		) {
			result.push(point)
		}
	})

	return result
}

export const filterPoints = (
	points: TConnectorPoint[],
	acceptValues: ConnectorAttachmentType[]
) : TConnectorPoint[] => {
	return filter(points, (point) => {
		return indexOf(acceptValues, point.vector) != -1
	})
}

export const epsEqual = (
	p1: number, p2: number,
	delta : number = 8
) : boolean => {
	return Math.abs(p1 - p2) <= delta
}

export const bezierControlPoint = (p: TConnectorPoint, w: number, h: number, offset: number = 0) : [number, number] => {
	let newX = p.x + offset
	let newY = p.y + offset

	if(
		p.vector == ConnectorAttachmentType.top ||
		p.vector == ConnectorAttachmentType.topLeft ||
		p.vector == ConnectorAttachmentType.topRight
	) {
		newY -= h
	}

	if(
		p.vector == ConnectorAttachmentType.bottom ||
		p.vector == ConnectorAttachmentType.bottomLeft ||
		p.vector == ConnectorAttachmentType.bottomRight
	) {
		newY += h
	}

	if(
		p.vector == ConnectorAttachmentType.left ||
		p.vector == ConnectorAttachmentType.topLeft ||
		p.vector == ConnectorAttachmentType.bottomLeft
	) {
		newX -= w
	}

	if(
		p.vector == ConnectorAttachmentType.right ||
		p.vector == ConnectorAttachmentType.topRight ||
		p.vector == ConnectorAttachmentType.bottomRight
	) {
		newX += w
	}

	return [newX, newY]
}

export function stepCoordinates(dX: number, dY: number, module: number) : [number, number] {
	const module_dX = dX >= 0 ? 
										Math.floor(dX / module) :
										Math.ceil(dX / module)
	const module_dY = dY >= 0 ? 
										Math.floor(dY / module) :
										Math.ceil(dY / module)

	const result_dX = module_dX * module
	const result_dY = module_dY * module

	return [result_dX, result_dY]
}