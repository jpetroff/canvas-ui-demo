import * as React from 'react'
import { bind, defaults, each, extend, filter, map, mapValues, min } from "lodash"
import { ICanvasCoordsCollection, ILayoutOptions, LAYOUT_RULE } from "../types"
import funcHorizontalLayout from './layout-horizontal'
import funcVerticalLayout from './layout-vertical'
import funcCSSLayout from './layout-css-defined'
import type {TCanvasContainerElement} from '../container'
import type {IConnectorProps} from '../connector'


class LayoutEngine {
	layoutOptions: ILayoutOptions

	constructor(opts?: ILayoutOptions) {
		this.layoutOptions = defaults<any, ILayoutOptions>(opts || {}, {
			moduleSize: 16,
			moduleGap: 2,
			normalizeWidth: false,
			normalizeHeight: false,
			layout: LAYOUT_RULE.css
		})
	}

	calcLayout(currentCoords: ICanvasCoordsCollection) : ICanvasCoordsCollection {
		switch(this.layoutOptions.layout) {
			case LAYOUT_RULE.horizontal: return this.calcLayoutHorizontal(currentCoords);
			case LAYOUT_RULE.vertical: return this.calcLayoutVertical(currentCoords);
			case LAYOUT_RULE.css: return this.calcLayoutCSS(currentCoords);
			default: return currentCoords;
		}
	}

	getContainerCoordinateProps(key: string, coordsCollection: ICanvasCoordsCollection) {
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

	prepareElementRender(element: React.ReactElement<any>, containerCoordsCollection: ICanvasCoordsCollection) : React.ReactElement<any> {
		const updatedProps = extend(element.props, this.getContainerCoordinateProps(element.key, containerCoordsCollection))

		return React.cloneElement(element, { ...updatedProps, key: element.key, dataKey: element.key}, ...element.props.children)
	}

	createDragPlaceholder(element: React.ReactElement, dX: number, dY: number, key: string, containerCoordinatesCollection: ICanvasCoordsCollection) {
		const containerCoordinates = containerCoordinatesCollection[key]
		if(!containerCoordinates) return null
		if(dX == 0 && dY == 0) return null

		return React.cloneElement(element,
			extend(element.props, {
				left: this.moduleToPx(containerCoordinates.moduleX + dX) + containerCoordinates.parentOffset.x,
				top: this.moduleToPx(containerCoordinates.moduleY + dY) + containerCoordinates.parentOffset.y,
				w: this.moduleToPx(containerCoordinates.moduleW),
				h: this.moduleToPx(containerCoordinates.moduleH)
			})
		)
	}

	calcContainerBoundingRects(elements: (HTMLElement & TCanvasContainerElement)[], parentX: number = 0, parentY: number = 0) : ICanvasCoordsCollection {
		let result : ICanvasCoordsCollection = {}
		elements.map( (element, index) => {

			const elementBoundingRect = element.getBoundingClientRect()
			const elementStyleMap = window.getComputedStyle(element)
			const elementKey = element.getAttribute('data-key')

			if(!elementKey) return

			const elementNormalizedHeight = this.normalizeDimensionValue(elementBoundingRect.height)
			const elementNormalizedWidth = this.normalizeDimensionValue(elementBoundingRect.width)

			const isAbsolute = !!element.getAttribute('data-canvas-absolute')
			const boundTo = element.getAttribute('data-canvas-bound') || undefined
			const connectTo = element.getAttribute('data-canvas-connect') || undefined

			let parentOffset = { x: 0, y: 0 }
			if(!isAbsolute) {
				parentOffset = {
					x: elementBoundingRect.x - parentX,
					y: elementBoundingRect.y - parentY
				}
			} else if (boundTo && result[boundTo]) {
				parentOffset = {
					x: result[boundTo].parentOffset.x + this.moduleToPx( result[boundTo].moduleX || 0),
					y: result[boundTo].parentOffset.y + this.moduleToPx( result[boundTo].moduleY || 0)
				}
			}

			result[elementKey] = {
				key: elementKey,
				index,
				isAbsolute,
				boundTo,
				connectTo,

				height: this.layoutOptions.normalizeHeight ? elementNormalizedHeight : elementBoundingRect.height,
				width: this.layoutOptions.normalizeWidth ? elementNormalizedWidth : elementBoundingRect.width,
				moduleY: this.getPositionCSSProperty('top', elementStyleMap),
				moduleX: this.getPositionCSSProperty('left', elementStyleMap),
				moduleH: elementNormalizedHeight / this.layoutOptions.moduleSize,
				moduleW: elementNormalizedWidth / this.layoutOptions.moduleSize,
				
				parentOffset
			}
		})
		return result
	}

	createConnectors(coordsCollection: ICanvasCoordsCollection) {
		let connectors : IConnectorProps[] = []
		
		each(coordsCollection, (item) => {
			const connectedContainer = item.connectTo

			if(connectedContainer && coordsCollection[connectedContainer]) {
				const startContainer = {
					top: item.parentOffset.y + this.moduleToPx(item.moduleY),
					bottom: item.parentOffset.y + this.moduleToPx(item.moduleY) + item.height,
					left: item.parentOffset.x + this.moduleToPx(item.moduleX),
					right: item.parentOffset.x + this.moduleToPx(item.moduleX) + item.width,
				}
				const endContainer = {
					top: coordsCollection[connectedContainer].parentOffset.y + this.moduleToPx(coordsCollection[connectedContainer].moduleY),
					bottom: coordsCollection[connectedContainer].parentOffset.y + this.moduleToPx(coordsCollection[connectedContainer].moduleY) + coordsCollection[connectedContainer].height,
					left: coordsCollection[connectedContainer].parentOffset.x + this.moduleToPx(coordsCollection[connectedContainer].moduleX),
					right: coordsCollection[connectedContainer].parentOffset.x + this.moduleToPx(coordsCollection[connectedContainer].moduleX) + coordsCollection[connectedContainer].width,
				}

				const { from, to } = this.findClosestPath(
					this.calcConnectionPoints(startContainer),
					this.calcConnectionPoints(endContainer)
				)
				
				if(from == null || to == null) return

				const connectA = from
				const connectB = to
				const top = min([connectA[1], connectB[1]])
				const left = min([connectA[0], connectB[0]])
				const w = Math.abs(connectA[0] - connectB[0])
				const h = Math.abs(connectA[1] - connectB[1])
				connectors.push({
					top,
					left,
					w,
					h,
					start: [
						left + w - connectA[0],
						top + h - connectA[1]
					],
					end: [
						left + w - connectB[0],
						top + h - connectB[1]
					]
				})
			}
		})
		return connectors
	}

	private calcConnectionPoints(container: { top: number, bottom: number, left: number, right: number}) : [number,number][] {
		let result = []
		const halfW = (container.right - container.left)/2
		const halfH = (container.bottom - container.top)/2

		// for(let x = container.left; x <= (container.left+2*halfW); x = x + halfW ) {
		// 	for(let y = container.top; y <= (container.top+2*halfH); y = y + halfH ) {
		// 		result.push([x,y])
		// 	}
		// }

		result = [
			[container.left + halfW, container.top],
			[container.left + 2*halfW, container.top + halfH],
			[container.left + halfW, container.top + 2*halfH],
			[container.left, container.top + halfH]
		]

		return result
	}

	private findClosestPath(from: [number,number][], to: [number,number][]) : { from: [number, number] | null, to: [number, number] | null } {
		let minLength = Number.MAX_SAFE_INTEGER
		let result = {
			from: null,
			to: null
		}

		each(from, (fromPoint) => {
			each(to, (toPoint) => {
				const X = toPoint[0] - fromPoint[0]
				const Y = toPoint[1] - fromPoint[1]
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

	normalizeDimensionValue(currentLength: number) : number {
		const mod = currentLength % this.layoutOptions.moduleSize
		if(mod > 0) return (Math.floor(currentLength / this.layoutOptions.moduleSize) + 1) * this.layoutOptions.moduleSize

		return currentLength
	}

	private calcLayoutHorizontal = bind(funcHorizontalLayout, this)
	private calcLayoutVertical = bind(funcVerticalLayout, this)
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