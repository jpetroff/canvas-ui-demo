import { keyBy, map, transform } from 'lodash'
import { _r } from '../libs/utils'
import { TAreaContext } from '.'


export function measureContainers(
	canvas: Element,
	descriptors: IContainerDescriptorCollection,
	areaContext: TAreaContext
) : TContainerMeasureDict {
	const containers = Array.from(canvas.querySelectorAll(`[data-canvas-container]`))
	const canvasRect = canvas.getBoundingClientRect()
	const scale = areaContext.scale

	const containerDescriptorArray = map(containers, (container) => {
		try {
			const rect = container.getBoundingClientRect()
			const styles = getElementCSS(container)
			const key = container.getAttribute(`data-key`)
			if(!key) return
	
			return {
				relative: {
					left: _r(getCSSProperty('left', styles)) || 0,
					top: _r(getCSSProperty('top', styles)) || 0,
				},
				extra: descriptors[key]?.extra || !!container.getAttribute(`[data-canvas-extra]`) || false,
				absolute: descriptors[key]?.absolute || !!container.getAttribute(`[data-canvas-extra]`) || false,
				sticky: descriptors[key]?.sticky || !container.getAttribute(`[data-canvas-sticky]`) || false,
				stickTo: descriptors[key]?.stickTo || null,
				offset: {
					left: _r(rect.left - canvasRect.left),
					top: _r(rect.top - canvasRect.top)
				},
				left: rect.left,
				top: rect.top,
				width: _r(rect.width),
				height: _r(rect.height),
				key
			}
		} catch(err) {
			console.warn(err)
		}
	})


	const containerDescriptorCollection : TContainerMeasureDict = keyBy<TContainerMeasure>(containerDescriptorArray, 'key')

	// console.log(containerDescriptorCollection)
	// const result = transform(
	// 	containerDescriptorCollection, 
	// 	(result, container, key) => {
	// 		if(container.stickTo || containerDescriptorCollection[container.stickTo]) {
	// 			result[key].parent = {
	// 				left: containerDescriptorCollection[container.stickTo].offset.left,
	// 				top: containerDescriptorCollection[container.stickTo].offset.top,
	// 				width: containerDescriptorCollection[container.stickTo].width,
	// 				height: containerDescriptorCollection[container.stickTo].height
	// 			}
	// 		}
	// 		return result
	// 	},
	// 	{}
	// )

	return containerDescriptorCollection
}

function getElementCSS(element: Element) : CSSStyleDeclaration {
	return window.getComputedStyle(element)
}


function getCSSProperty(property: string, elementStyleMap: CSSStyleDeclaration): number | undefined {
	const currentProp = elementStyleMap.getPropertyValue(property)

	if(currentProp && currentProp != 'auto') {
		return parseInt(currentProp.toString())
	}

	return undefined
}

// export function measureSelf(
// 	element: Element[]
// ) {

// }