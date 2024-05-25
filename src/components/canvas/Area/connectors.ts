import { each, min } from 'lodash'
import { ConnectorAttachmentType,  } from '../Connector'
import { getMutableBoundingRect, getRoundedCoords, filterOverlappingPoints, filterPoints, calcConnectorPoints, findClosestPoints } from '../libs/utils'

export enum ChildConnectorOrientation {
	horizontal = 'horizontal',
	vertical = 'vertical',
	self = 'self',
	parent = 'parent'
}

export function getRealConnectorPoints(
	element: Element, 
	offset: { x: number, y: number } = { x: 0, y: 0},
	parent: Element, 
	orientation: ChildConnectorOrientation = ChildConnectorOrientation.self,
	scale: number = 1
) : [TRoundedCoords, ConnectorAttachmentType[] ] {
	const elementRects = element.getBoundingClientRect()
	const CCO = ChildConnectorOrientation
	const CAT = ConnectorAttachmentType

	// console.log('elem',element)


	let result = getMutableBoundingRect(elementRects)
	// console.log(result)
	if(parent) {
		const parentRects = parent.getBoundingClientRect()
		result.top = (orientation == CCO.vertical || orientation == CCO.parent) ? parentRects.top / scale : elementRects.top / scale
		result.y = (orientation == CCO.vertical || orientation == CCO.parent) ? parentRects.top / scale : elementRects.top / scale
		result.bottom = (orientation == CCO.vertical || orientation ==  CCO.parent) ? parentRects.bottom / scale : elementRects.bottom / scale
		result.left = (orientation == CCO.horizontal || orientation == CCO.parent) ? parentRects.left / scale : elementRects.left / scale
		result.x = (orientation == CCO.horizontal || orientation == CCO.parent) ? parentRects.left / scale : elementRects.left / scale
		result.right = (orientation == CCO.horizontal || orientation == CCO.parent) ? parentRects.right / scale : elementRects.right / scale
		result.width = (orientation == CCO.horizontal || orientation == CCO.parent) ? parentRects.width / scale : elementRects.width / scale
		result.height = (orientation == CCO.vertical || orientation == CCO.parent) ? parentRects.width / scale : elementRects.height / scale
	}

	let availableConnectorPoints = []
	if(orientation && orientation == CCO.horizontal) {
		availableConnectorPoints = [CAT.left, CAT.right]
	} else if(orientation && orientation == CCO.vertical) {
		availableConnectorPoints = [CAT.top, CAT.bottom]
	} else {
		availableConnectorPoints = [CAT.top, CAT.bottom, CAT.left, CAT.right]
	}
	// console.log(result)
	return [
		getRoundedCoords(result, offset),
		availableConnectorPoints
	]
}


export function createConnectors(connectors: TConnectorPathList, canvasElem: Element, containerCoordinatesCollection: IContainerDescriptorCollection, scale: number = 1) {
	let definedConnectors : TConnectorDescriptorList = []
	const AT = ConnectorAttachmentType
	
	each(connectors, (connector) => {
		try {
			const startElem = canvasElem.querySelector(`[data-key="${connector.from}"]`)
			const endElem = canvasElem.querySelector(`[data-key="${connector.to}"]`)
			// const startElem = containerCoordinatesCollection[connector.from]
			// const endElem = containerCoordinatesCollection[connector.to]
			const canvasElemDomRect = canvasElem.getBoundingClientRect()
			const canvasOffset = {
				x: canvasElemDomRect.left,
				y: canvasElemDomRect.top
			}

			if(!startElem || !endElem) return

			const startElemHasParent = startElem.closest(`[data-canvas-container]`) != startElem && startElem.closest(`[data-canvas-container]`)
			// const startElemParent = startElemHasParent ? containerCoordinatesCollection[startElemHasParent.getAttribute('data-canvas-key')] : null

			const endElemHasParent = endElem.closest(`[data-canvas-container]`) != endElem && endElem.closest(`[data-canvas-container]`)
			// const endElemParent = endElemHasParent ? containerCoordinatesCollection[endElemHasParent.getAttribute('data-canvas-key')] : null

			const [startContainer, startAttachment] = getRealConnectorPoints(startElem, canvasOffset, startElemHasParent, startElemHasParent ? ChildConnectorOrientation.horizontal : ChildConnectorOrientation.self, scale)
			const [endContainer, endAttachment] = getRealConnectorPoints(endElem, canvasOffset, endElemHasParent, endElemHasParent ? ChildConnectorOrientation.horizontal : ChildConnectorOrientation.self, scale)

			// console.log('Coords', startContainer, endContainer)
			// console.log('attachment', startElemHasParent, startAttachment, endElemHasParent, endAttachment)

			const startConnectorPoints = 
			filterOverlappingPoints(
				endContainer,
				filterPoints(
					calcConnectorPoints(startContainer),
					startAttachment
				)
			)

			const endConnectorPoints = 
			filterOverlappingPoints(
				startContainer,
				filterPoints(
					calcConnectorPoints(endContainer),
					endAttachment
				)
			)

			

			const { from, to } = findClosestPoints(
				startConnectorPoints,
				endConnectorPoints
			)
			
			if(from == null || to == null) return

			const top = min([from.y, to.y])
			const left = min([from.x, to.x])
			const w = Math.abs(from.x - to.x)
			const h = Math.abs(from.y - to.y)
			definedConnectors.push({
				from: connector.from,
				to: connector.to,
				top,
				left,
				w,
				h,
				start: {
					x: from.x - left,
					y: from.y - top,
					vector: from.vector
				},
				end: {
					x: to.x - left,
					y: to.y - top,
					vector: to.vector
				}
			})
		} catch(err) {
			console.warn(`Error calculating connection ${connector.from} → ${connector.to}: ${err}`)
		}
	})
	return definedConnectors
}