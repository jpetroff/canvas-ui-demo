import * as React from 'react'
import { bind, defaults, each, extend, clone, isObject, min } from "lodash"
import { ConnectorAttachmentType, LAYOUT_RULE } from "../types"
import funcCSSLayout from './layout-css-defined'
import type { TContainerCoordCollection, ILayoutOptions, TConnectorDescriptionList, TDefinedConnectorList } from "../types"
import type {TCanvasContainerElement} from '../container'
import type {IConnectorProps} from '../connector'
import { calcConnectorPoints, filterOverlappingPoints, filterPoints, findClosestPoints, getRoundedCoords } from './utils'


class LayoutEngine {
	private layoutOptions: ILayoutOptions
	private previousCoordsCollection: TContainerCoordCollection

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

	storeCoordsCollection(coords: TContainerCoordCollection) {
		this.previousCoordsCollection = coords
	}

	retrieveCoordsCollection() {
		return this.previousCoordsCollection
	}

	isSameLayout(newContainerCoordsCollection: any) : boolean {
		if(!this.previousCoordsCollection || !isObject(this.previousCoordsCollection)) return false

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

		return deepEqual(this.previousCoordsCollection, newContainerCoordsCollection)
	}

	calcLayout(currentCoords: TContainerCoordCollection) : TContainerCoordCollection {
		switch(this.layoutOptions.layout) {
			case LAYOUT_RULE.css: return this.calcLayoutCSS(currentCoords);
			default: return currentCoords;
		}
	}

	getContainerCoordinateProps(key: string, coordsCollection: TContainerCoordCollection) {
		const containerCoordinates = coordsCollection[key]
		if(!containerCoordinates) return {}

		if(containerCoordinates.isAbsolute) {
			return { 
				left: this.moduleToPx(containerCoordinates.moduleX || 0) + containerCoordinates.parentOffset.x,
				top: this.moduleToPx(containerCoordinates.moduleY || 0) + containerCoordinates.parentOffset.y
			}
		} else {
			return { 
				left: this.moduleToPx(containerCoordinates.moduleX || 0),
				top: this.moduleToPx(containerCoordinates.moduleY || 0)
			}
		}
	}

	prepareElementRender(element: React.ReactElement, containerCoordsCollection: TContainerCoordCollection) : React.ReactElement<any> {
		const coordinateProps = this.getContainerCoordinateProps(element.props.canvasKey, containerCoordsCollection)
		if(containerCoordsCollection[element.props.canvasKey]) console.log(element.props.canvasKey, containerCoordsCollection[element.props.canvasKey].moduleX, containerCoordsCollection[element.props.canvasKey].moduleY)
		const updatedProps = {
			...element.props,
			...coordinateProps
		}

		console.log(updatedProps)


		return React.cloneElement(element, { ...updatedProps, key: element.props.canvasKey}, element.props.children)
	}

	createDragPlaceholder(element: React.ReactElement, ref: React.MutableRefObject<Partial<HTMLDivElement>>) {
		if(!element) return

		const props = extend(clone(element.props), {ref: ref, key: '__canvas-placeholder-drag__'})

		return React.cloneElement(element, props)
	}

	updateDragPlaceholder(
		key: string, 
		ref: React.MutableRefObject<Partial<HTMLDivElement>>, 
		module_dX: number, module_dY: number,
		containerCoordinatesCollection: TContainerCoordCollection
	) {
		if(!containerCoordinatesCollection || !ref || !key) return

		
		const containerCoordinates = containerCoordinatesCollection[key]
		console.log('Parent container', this.moduleToPx(containerCoordinates.moduleX + module_dX), this.moduleToPx(containerCoordinates.moduleY + module_dY), containerCoordinates.parentOffset.x, containerCoordinates.parentOffset.y)
		// console.log('Drag container', containerCoordinates.moduleX, containerCoordinates.moduleY, containerCoordinates.parentOffset.x, containerCoordinates.parentOffset.y)


		ref.current && ref.current.setAttribute && ref.current.setAttribute('style', `
			left: ${(this.moduleToPx(module_dX) + containerCoordinates.parentOffset.x)}px;
			top: ${this.moduleToPx(module_dY) + containerCoordinates.parentOffset.y}px;
			width: ${containerCoordinates.width}px;
			height: ${containerCoordinates.height}px;
			z-index: 999999;
			display: block;
		`)

		console.log(`
			left: ${(this.moduleToPx(module_dX) + containerCoordinates.parentOffset.x)}px;
			top: ${this.moduleToPx(module_dY) + containerCoordinates.parentOffset.y}px;
			width: ${containerCoordinates.width}px;
			height: ${containerCoordinates.height}px;
			z-index: 999999;
			display: block;
		`)

		console.log(ref.current.getAttribute('style'))
	}

	hideDragContainer(ref: React.MutableRefObject<Partial<HTMLDivElement>>) {
		ref.current && ref.current.setAttribute && ref.current.setAttribute('style', '')
	}

	calcContainerBoundingRects(elements: (HTMLElement & TCanvasContainerElement)[], parentX: number = 0, parentY: number = 0) : TContainerCoordCollection {
		let result : TContainerCoordCollection = {}
		each(elements, (element, index) => {

			const elementBoundingRect = element.getBoundingClientRect()
			const elementStyleMap = window.getComputedStyle(element) 
			const elementKey = element.getAttribute('data-key')

				
			if(!elementKey) return
			
			const elementNormalizedHeight = this.normalizeDimensionValue(elementBoundingRect.height)
			const elementNormalizedWidth = this.normalizeDimensionValue(elementBoundingRect.width)

			const isAbsolute = !!element.getAttribute('data-canvas-absolute')
			const boundTo = element.getAttribute('data-canvas-bound') || undefined

			let parentOffset = { x: 0, y: 0 }
			if(!isAbsolute) {
				parentOffset = {
					x: elementBoundingRect.x - parentX,
					y: elementBoundingRect.y - parentY
				}
			} 
			// else if (boundTo && result[boundTo]) {
			// 	parentOffset = {
			// 		x: result[boundTo].parentOffset.x + this.moduleToPx( result[boundTo].moduleX || 0),
			// 		y: result[boundTo].parentOffset.y + this.moduleToPx( result[boundTo].moduleY || 0)
			// 	}
			// }

			result[elementKey] = {
				key: elementKey,
				index,
				isAbsolute,
				boundTo,

				height: this.layoutOptions.normalizeHeight ? elementNormalizedHeight : elementBoundingRect.height,
				width: this.layoutOptions.normalizeWidth ? elementNormalizedWidth : elementBoundingRect.width,
				moduleY: Math.round(this.getPositionCSSProperty('top', elementStyleMap) / this.layoutOptions.moduleSize),
				moduleX: Math.round(this.getPositionCSSProperty('left', elementStyleMap) / this.layoutOptions.moduleSize),
				moduleH: elementNormalizedHeight / this.layoutOptions.moduleSize,
				moduleW: elementNormalizedWidth / this.layoutOptions.moduleSize,
				
				parentOffset
			}
		})

		each(elements, (element, index) => {

			const elementBoundingRect = element.getBoundingClientRect()
			const elementStyleMap = window.getComputedStyle(element) 
			const elementKey = element.getAttribute('data-key')

				
			if(!elementKey) return
			
			const elementNormalizedHeight = this.normalizeDimensionValue(elementBoundingRect.height)
			const elementNormalizedWidth = this.normalizeDimensionValue(elementBoundingRect.width)

			const isAbsolute = !!element.getAttribute('data-canvas-absolute')
			const boundTo = element.getAttribute('data-canvas-bound') || undefined

			if(elementKey == 'entry-form-2-comment') console.log('~~', result[boundTo])

			let parentOffset = { x: 0, y: 0 }
			// if(!isAbsolute) {
			// 	parentOffset = {
			// 		x: elementBoundingRect.x - parentX,
			// 		y: elementBoundingRect.y - parentY
			// 	}
			// } 
			if (boundTo && result[boundTo]) {
				parentOffset = {
					x: result[boundTo].parentOffset.x,
					y: result[boundTo].parentOffset.y
				}
				result[elementKey] = {
					key: elementKey,
					index,
					isAbsolute,
					boundTo,
	
					height: this.layoutOptions.normalizeHeight ? elementNormalizedHeight : elementBoundingRect.height,
					width: this.layoutOptions.normalizeWidth ? elementNormalizedWidth : elementBoundingRect.width,
					moduleY: (this.getPositionCSSProperty('top', elementStyleMap) - result[boundTo].parentOffset.y) / this.layoutOptions.moduleSize,
					moduleX: (this.getPositionCSSProperty('left', elementStyleMap) - result[boundTo].parentOffset.x) / this.layoutOptions.moduleSize,
					moduleH: elementNormalizedHeight / this.layoutOptions.moduleSize,
					moduleW: elementNormalizedWidth / this.layoutOptions.moduleSize,
					
					parentOffset
				}
			}
		})
		return result
	}

	createConnectors(connectors: TConnectorDescriptionList, canvasElem: React.MutableRefObject<HTMLDivElement>) {
		let definedConnectors : TDefinedConnectorList = []
		
		each(connectors, (connector) => {
			try {
				const startElem = canvasElem.current.querySelector(`[data-key="${connector.from}"]`)
				const endElem = canvasElem.current.querySelector(`[data-key="${connector.to}"]`)


				if(!startElem || !endElem) return

				const startElemDomRect = startElem.getBoundingClientRect()
				const endElemDomRect = endElem.getBoundingClientRect()
				const canvasElemDomRect = canvasElem.current.getBoundingClientRect()

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

				// console.log(startContainer, startConnectorPoints)
				// console.log(endContainer, endConnectorPoints)

				const { from, to } = findClosestPoints(
					startConnectorPoints,
					endConnectorPoints
				)

				// console.log(from, to)
				
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

	private calcLayoutCSS = bind(funcCSSLayout, this)

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