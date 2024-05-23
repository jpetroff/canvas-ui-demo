import * as React from 'react'
import { each, extend, clone, isObject, min, reduce, find, merge } from "lodash"
import type {ICanvasContainerProps, TCanvasContainerElement} from '../Container'
import { ConnectorAttachmentType } from '../Connector'
import { _f, _r, calcConnectorPoints, filterOverlappingPoints, filterPoints, findClosestPoints, getMutableBoundingRect, getRoundedCoords } from './utils'

export enum ChildConnectorOrientation {
	horizontal = 'horizontal',
	vertical = 'vertical',
	self = 'self',
	parent = 'parent'
}

declare interface ILayoutOptions {
	moduleSize?: number
}

type TLayoutOptionsInternal = {
	moduleSize: number
}

class LayoutEngine {
	private options: TLayoutOptionsInternal

	constructor(opts: ILayoutOptions) {
		this.setOptions(opts)
	}

	setOptions(opts: ILayoutOptions) {
		this.options = {
			moduleSize: opts.moduleSize || 4
		}
	}

	needLayoutUpdate(collectionA: TContainerDescriptorCollection, collectionB: TContainerDescriptorCollection) : boolean {
		if(!isObject(collectionA) || !isObject(collectionB)) return true

		function deepEqual(object1, object2, prefix = '') {
			const keys1 = Object.keys(object1)
			const keys2 = Object.keys(object2)
		
			if (keys1.length !== keys2.length) {
				console.log('Changed number of items', keys1.length, keys2.length)
				return false
			}
		
			for (const key of keys1) {
				const val1 = object1[key]
				const val2 = object2[key]

				const areObjects = isObject(val1) && isObject(val2)
				if (
					areObjects && !deepEqual(val1, val2, `${prefix}.${key}`) 
				) {
					console.log(`Different objects ${prefix}.${key}:`, val1, val2)
					return false
				}
				if(!areObjects && val1 !== val2) {
					console.log(`Different values at ${prefix}.${key}:`, val1, val2)
					return false
				}
			}
		
			return true
		}

		return !deepEqual(collectionA, collectionB)
	}

	calcBoundingRects(elements: (HTMLElement & TCanvasContainerElement)[]) : TContainerRect[] {
		return reduce(elements, (result, element, index) => {
			const key = element.getAttribute('data-key')
			const boundingRect = element.getBoundingClientRect()
			if(key) {
				result.push({
					key: element.getAttribute('data-key'),
					index,
					left: _f(element.offsetLeft),
					top: _f(element.offsetTop),
					width: _f(boundingRect.width),
					height: _f(boundingRect.height),
					isAbsolute: !!element.getAttribute('data-canvas-absolute') || void 0,
					canBeBound: !!element.getAttribute('data-canvas-allow-bound') || void 0,
					boundToContainer: element.getAttribute('data-canvas-bound') || void 0
				})
			}

			return result
		}, [])
	}

	calcLayout(
		currentBoundingRects : TContainerRect[], 
		userProps: IContainerDescriptorPropCollection,
	) : TContainerDescriptorCollection {

		return reduce(currentBoundingRects,
			(result, containerCalcRect, index) => {
				try {
					const key = containerCalcRect.key
					result[key] = merge(
						(userProps[key] || {}),
						containerCalcRect
					)
	
					result[key].relative = {
						left: (userProps[key] && userProps[key].relative) ? userProps[key].relative.left : 0,
						top: (userProps[key] && userProps[key].relative) ? userProps[key].relative.top : 0,
					}

					if(
						(userProps[key] && userProps[key].boundToContainer) ||
						(containerCalcRect.canBeBound && containerCalcRect.boundToContainer)
					) {
						const relatedContainerKey = userProps[key]?.boundToContainer || containerCalcRect.boundToContainer
						const relatedContainer = find(currentBoundingRects, {key: relatedContainerKey})
						console.log('init bound coords', containerCalcRect.key, '→', relatedContainer, userProps[key]?.relative)
						if(relatedContainer && !userProps[key]?.relative) {
							result[key].relative.left = relatedContainer.left
							result[key].relative.top = relatedContainer.top
						} else if(
							relatedContainer && userProps[key]?._lastKnownAttachedToCoords &&
							relatedContainer.key == userProps[key]._lastKnownAttachedToCoords.key && 
							(
								userProps[key]._lastKnownAttachedToCoords.top != relatedContainer.top ||
								userProps[key]._lastKnownAttachedToCoords.left != relatedContainer.left ||
								userProps[key]._lastKnownAttachedToCoords.width != relatedContainer.width ||
								userProps[key]._lastKnownAttachedToCoords.height != relatedContainer.height 
							)
						) {
							console.log('~~~~~~LKAC', userProps[key]?._lastKnownAttachedToCoords, relatedContainer)
							console.log(key, result[key].top, result[key].left)
							//on resize trying to recalculate from last known parent coordinates
							// each(['top', 'left'], (side) => {
							// 	const dimension = side == 'top' ? 'height' : 'width'
							// 	const relativePart = relatedContainer[side] - userProps[key]._lastKnownAttachedToCoords[side]
							// 	const deltaDimension = Math.abs(userProps[key]._lastKnownAttachedToCoords[dimension] - relatedContainer[dimension])
							// 	result[key][side] = result[key].relative[side] = _r(
							// 		relatedContainer[side] + relativePart * (relatedContainer[dimension] / deltaDimension)
							// 	)
							// }) 
							// result[key].relative.left -= _r(
							// 	(userProps[key]._lastKnownAttachedToCoords.left - relatedContainer.left)
							// )
							// result[key].relative.top -= _r(
							// 	(userProps[key]._lastKnownAttachedToCoords.top - relatedContainer.top)
							// )
							// result[key].left -= _r(
							// 	(userProps[key]._lastKnownAttachedToCoords.left - relatedContainer.left)
							// )
							// result[key].top -= _r(
							// 	(userProps[key]._lastKnownAttachedToCoords.top - relatedContainer.top)
							// )
							console.log(key, result[key].top, result[key].left)
						}
						result[key]._lastKnownAttachedToCoords = {
							left: relatedContainer.left,
							top: relatedContainer.top,
							width: relatedContainer.width,
							height: relatedContainer.height,
							key: relatedContainer.key
						}
					}

					return result

				} catch(err) {
					console.warn(err)
					return result
				}
			}
		, {})
	}

	getAbsoluteContainerOffset(container: Partial<TContainerDescriptor>) : [number, number] {
		try {
			if(container.isAbsolute == true) {
				return [
					_r((container.relative && container.relative.left) || container.left || 0),
					_r((container.relative && container.relative.top) || container.top || 0)
				]
			} else {
				return [
					_r( container.left ),
					_r( container.top )
				]
			}
		} catch (err) {
			return [0,0]
		}
	}

	safeContainerOffset(container) : [number, number] {
		if(!container) return [0,0]

		return [
			_r((container.relative && container.relative.left) || container.left || 0),
			_r((container.relative && container.relative.top) || container.top || 0)
		]
	}

	createDragPlaceholder(element: React.ReactElement, id: string) {
		if(!element) return

		const props = extend(clone(element.props), {id, key: '__canvas-placeholder-drag__'})

		return React.cloneElement(element, props)
	}

	updateDragPlaceholder(
		dX: number, dY: number,
		key: string, 
		targetElement: Element,
		dragElement: Element,
		canvasElement: Element
	) {
		if(!targetElement || !dragElement || !key) return


		const {left, top, width, height} = targetElement.getBoundingClientRect()
		const canvasRects = canvasElement.getBoundingClientRect()

		dragElement.setAttribute && dragElement.setAttribute('style', 
			this.prepareDragPlaceholderCSS({
				left: left - canvasRects.left + dX,
				top: top - canvasRects.top + dY,
				width: width,
				height: height
			})
		)
	}

	private prepareDragPlaceholderCSS(styleProps: TRect) {
		try {
			return [
				`left: ${styleProps.left || 0}px`,
				`top: ${styleProps.top || 0}px`,
				`width: ${styleProps.width || 24}px`,
				`height: ${styleProps.height || 24}px`,
				'z-index: 999999',
				'position: absolute',
				'display: block'
			].join('; ')
		} catch (err) {
			return ''
		}
	}

	hideDragContainer(element: Element) {
		element && element.setAttribute && element.setAttribute('style', '')
	}

	private getRealConnectorPoints(
		element: TContainerDescriptor, 
		offset: { x: number, y: number } = { x: 0, y: 0},
		parent: TContainerDescriptor = null, 
		orientation: ChildConnectorOrientation = ChildConnectorOrientation.self
	) : [TRoundedCoords, ConnectorAttachmentType[] ] {
		const elementRects = element.getBoundingClientRect()
		const CCO = ChildConnectorOrientation
		const CAT = ConnectorAttachmentType

		console.log('elem',element)


		let result = getMutableBoundingRect(elementRects)
		console.log(result)
		if(parent) {
			const parentRects = parent.getBoundingClientRect()
			result.top = (orientation == CCO.vertical || orientation == CCO.parent) ? parentRects.top: elementRects.top
			result.y = (orientation == CCO.vertical || orientation == CCO.parent) ? parentRects.top: elementRects.top
			result.bottom = (orientation == CCO.vertical || orientation ==  CCO.parent) ? parentRects.bottom: elementRects.bottom
			result.left = (orientation == CCO.horizontal || orientation == CCO.parent) ? parentRects.left: elementRects.left
			result.x = (orientation == CCO.horizontal || orientation == CCO.parent) ? parentRects.left: elementRects.left
			result.right = (orientation == CCO.horizontal || orientation == CCO.parent) ? parentRects.right: elementRects.right
			result.width = (orientation == CCO.horizontal || orientation == CCO.parent) ? parentRects.width: elementRects.width
			result.height = (orientation == CCO.vertical || orientation == CCO.parent) ? parentRects.width: elementRects.height
		}

		let availableConnectorPoints = []
		if(orientation && orientation == CCO.horizontal) {
			availableConnectorPoints = [CAT.left, CAT.right]
		} else if(orientation && orientation == CCO.vertical) {
			availableConnectorPoints = [CAT.top, CAT.bottom]
		} else {
			availableConnectorPoints = [CAT.top, CAT.bottom, CAT.left, CAT.right]
		}
		console.log(result)
		return [
			getRoundedCoords(result, offset),
			availableConnectorPoints
		]
	}

	createConnectors(connectors: TConnectorPathList, canvasElem: Element, containerCoordinatesCollection: TContainerDescriptorCollection) {
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

				const [startContainer, startAttachment] = this.getRealConnectorPoints(startElem, canvasOffset, startElemHasParent, startElemHasParent ? ChildConnectorOrientation.horizontal : ChildConnectorOrientation.self)
				const [endContainer, endAttachment] = this.getRealConnectorPoints(endElem, canvasOffset, endElemHasParent, endElemHasParent ? ChildConnectorOrientation.horizontal : ChildConnectorOrientation.self)

				console.log('Coords', startContainer, endContainer)
				console.log('attachment', startElemHasParent, startAttachment, endElemHasParent, endAttachment)

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

	normalizeDimensionValue(currentLength: number) : number {
		const mod = currentLength % this.options.moduleSize
		if(mod > 0) return (Math.floor(currentLength / this.options.moduleSize) + 1) * this.options.moduleSize

		return currentLength
	}

	getPositionCSSProperty(property: string, elementStyleMap: CSSStyleDeclaration): number | undefined {
		const currentProp = elementStyleMap.getPropertyValue(property)

		if(currentProp && currentProp != 'auto') {
			return parseInt(currentProp.toString())
		}

		return undefined
	}

	moduleToPx(module: number): number {
		return this.options.moduleSize * module
	}

	pxToModule(px: number): number {
		return (Math.round(px / this.options.moduleSize)) * this.options.moduleSize
	}

	moduleToCSSStyle(module: number) : string {
		return (this.options.moduleSize * module).toString() + 'px'
	}

}

export default LayoutEngine