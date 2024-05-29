import { each, extend, isFunction, reduce, values } from "lodash"
import { getElementCSS, getCSSProperty } from './measure'

export function calcBoundingDimensions(
	canvas: Element,
	measuredContainers: TContainerMeasureDict,
	extra?: Element
) {

	const canvasRect = canvas.getBoundingClientRect()
	const extraRect = extra && isFunction(extra.getBoundingClientRect) ? extra.getBoundingClientRect() : null

	const allContainers : TContainerMeasure[] = extraRect ? 
		values(measuredContainers).concat([{
			offset: {
				left: extraRect.left - canvasRect.left,
				top: extraRect.top - canvasRect.top
			},
			width: extraRect.width,
			height: extraRect.height,
			left: extraRect.left,
			top: extraRect.top,
			key: null
		}]) :
		values(measuredContainers)

	const dimensions = reduce(allContainers, 
		(result, item, index) => {
			return {
				maxLeft: (item.offset.left + item.width)  > result.maxLeft ? (item.offset.left + item.width) : result.maxLeft, 
				maxTop: (item.offset.top + item.height) > result.maxTop ? (item.offset.top + item.height) : result.maxTop,
				minLeft: item.offset.left < result.minLeft ? item.offset.left : result.minLeft, 
				minTop: item.offset.top < result.minTop ? item.offset.top : result.minTop,
			}
		},
		{maxLeft: 0, maxTop: 0, minLeft: Number.MAX_SAFE_INTEGER, minTop: Number.MAX_SAFE_INTEGER}
	)

	return dimensions
}

export function getExtraPaddings(
	canvas: Element,
	dimensions: { maxLeft: number, maxTop: number, minLeft: number, minTop: number }
) : {top: number, left: number, right: number, bottom: number} {
	const canvasRect = canvas.getBoundingClientRect()
	const buffer = 64

	console.log(dimensions.maxLeft, canvasRect.width)
	console.log(dimensions.maxTop, canvasRect.height)

	return {
		top: 0,
		left: 0,
		right: dimensions.maxLeft - canvasRect.width + buffer,
		bottom: dimensions.maxTop - canvasRect.height + buffer
	}
}

export function resizeCanvas(
 canvas: HTMLElement,
 paddings: {top: number, left: number, right: number, bottom: number}
) {
	const canvasStyle = getElementCSS(canvas)

	const recalcPaddings = {
		top: Math.max(0, getCSSProperty('padding-top', canvasStyle) + paddings.top),
		left: Math.max(0, getCSSProperty('padding-left', canvasStyle) + paddings.left),
		bottom: Math.max(0, getCSSProperty('padding-bottom', canvasStyle) + paddings.bottom),
		right: Math.max(0, getCSSProperty('padding-right', canvasStyle) + paddings.right)
	}

	console.log(`Paddings resize`, paddings, recalcPaddings)

	setCanvasSize(canvas, recalcPaddings)
}

export function setCanvasSize(
	canvas: HTMLElement,
	paddings: {top: number, left: number, right: number, bottom: number}
) {
	const canvasUpdatedStyle = [
		`padding: ${paddings.top}px ${paddings.right}px ${paddings.bottom}px ${paddings.left}px`
	].join('; ')

	canvas.setAttribute('style', canvasUpdatedStyle)
}