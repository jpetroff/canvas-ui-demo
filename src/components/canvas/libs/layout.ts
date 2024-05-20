import * as React from 'react'
import { bind, defaults, each, extend, clone, isObject, min, map, reduce, find } from "lodash"
// import funcCSSLayout from './layout-css-defined'
import type {ICanvasContainerProps, TCanvasContainerElement} from '../container'
import { ConnectorAttachmentType } from '../connector'
import { _f, calcConnectorPoints, filterOverlappingPoints, filterPoints, findClosestPoints, getRoundedCoords } from './utils'
import { isAbsolute } from 'path'


export const enum LAYOUT_RULE {
	css = 'css'
}

declare interface ILayoutOptions {
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

class LayoutEngine {
	private layoutOptions: ILayoutOptions
	private previousCoordsCollection: TContainerDescriptorCollection

	constructor(opts?: ILayoutOptions) {
		this.setOptions(opts)
	}

	setOptions(opts: ILayoutOptions) {
		this.layoutOptions = defaults<any, ILayoutOptions>(opts || {}, {
			moduleSize: 16,
			moduleGap: 2,
			normalizeWidth: false,
			normalizeHeight: false,
			layout: LAYOUT_RULE.css
		})
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
					result[key] = containerCalcRect
	
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
		if(container.isAbsolute == true) {
			return [
				(container.relative && container.relative.left) || container.left || 0,
				(container.relative && container.relative.top) || container.top || 0
			]
		} else {
			return [
				container.left  || 0,
				container.top  || 0
			]
		}
	}

	safeContainerOffset(container) : [number, number] {
		if(!container) return [0,0]

		return [
			(container.relative && container.relative.left) || container.left || 0,
			(container.relative && container.relative.top) || container.top || 0
		]
	}

	prepareElementRender(
		element: React.ReactElement, containerDescriptorCollection: TContainerDescriptorCollection
	) : React.ReactElement<any> {
		const existingPassedProps : TContainerDescriptor = containerDescriptorCollection[element.props.canvasKey]

		const [left, top] = this.safeContainerOffset(existingPassedProps)

		const updatedProps : ICanvasContainerProps = {
			...element.props,
			left,
			top,
			key: element.props.canvasKey
		}

		if(existingPassedProps && existingPassedProps.isExtra) 
			updatedProps.isExtra = existingPassedProps.isExtra

		console.log('override bound', element.props.canvasKey, existingPassedProps, updatedProps.canBound, existingPassedProps?.canBeBound)
		if(existingPassedProps && existingPassedProps.boundToContainer) {
			updatedProps.boundTo = existingPassedProps.boundToContainer || true
		}

		return React.cloneElement(element, updatedProps, element.props.children)
	}

	createDragPlaceholder(element: React.ReactElement, ref: React.MutableRefObject<Partial<HTMLDivElement>>) {
		if(!element) return

		const props = extend(clone(element.props), {ref: ref, key: '__canvas-placeholder-drag__'})

		return React.cloneElement(element, props)
	}

	updateDragPlaceholder(
		dX: number, dY: number,
		key: string, 
		containerCoordinatesCollection: TContainerDescriptorCollection,
		ref: React.MutableRefObject<Partial<HTMLDivElement>>
	) {
		if(!containerCoordinatesCollection || !ref || !key) return

		const containerCoordinates = containerCoordinatesCollection[key]

		
		const [left, top] = this.getAbsoluteContainerOffset(containerCoordinates)

		ref.current && ref.current.setAttribute && ref.current.setAttribute('style', 
			this.prepareDragPlaceholderCSS({
				left: left + dX,
				top: top + dY,
				width: containerCoordinates.width,
				height: containerCoordinates.height,
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

	hideDragContainer(ref: React.MutableRefObject<Partial<HTMLDivElement>>) {
		ref.current && ref.current.setAttribute && ref.current.setAttribute('style', '')
	}

	createConnectors(connectors: TConnectorPathList, canvasElem: Element) {
		let definedConnectors : TConnectorDescriptorList = []
		
		each(connectors, (connector) => {
			try {
				const startElem = canvasElem.querySelector(`[data-key="${connector.from}"]`)
				const endElem = canvasElem.querySelector(`[data-key="${connector.to}"]`)


				if(!startElem || !endElem) return

				const startElemDomRect = startElem.getBoundingClientRect()
				const endElemDomRect = endElem.getBoundingClientRect()
				const canvasElemDomRect = canvasElem.getBoundingClientRect()

				const canvasOffset = {
					x: canvasElemDomRect.left,
					y: canvasElemDomRect.top
				}

				const startContainer = getRoundedCoords(startElemDomRect, canvasOffset)
				const endContainer = getRoundedCoords(endElemDomRect, canvasOffset)

				const startConnectorPoints = 
				filterOverlappingPoints(
					endContainer,
					filterPoints(
						calcConnectorPoints(startContainer),
						[ConnectorAttachmentType.bottom, ConnectorAttachmentType.top, ConnectorAttachmentType.left, ConnectorAttachmentType.right]
					)
				)

				const endConnectorPoints = 
				filterOverlappingPoints(
					startContainer,
					filterPoints(
						calcConnectorPoints(endContainer),
						[ConnectorAttachmentType.bottom, ConnectorAttachmentType.top, ConnectorAttachmentType.left, ConnectorAttachmentType.right]
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
		const mod = currentLength % this.layoutOptions.moduleSize
		if(mod > 0) return (Math.floor(currentLength / this.layoutOptions.moduleSize) + 1) * this.layoutOptions.moduleSize

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
		return this.layoutOptions.moduleSize * module
	}

	pxToModule(px: number): number {
		return (Math.round(px / this.layoutOptions.moduleSize)) * this.layoutOptions.moduleSize
	}

	moduleToCSSStyle(module: number) : string {
		return (this.layoutOptions.moduleSize * module).toString() + 'px'
	}

}

export default LayoutEngine