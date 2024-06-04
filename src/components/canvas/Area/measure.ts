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

			// console.log(`Measure extra:`, key, descriptors[key]?.extra, container.hasAttribute(`data-canvas-extra`), descriptors[key]?.extra || !!container.hasAttribute(`data-canvas-extra`))
			// console.log(`Measure absolute:`, key, descriptors[key]?.absolute, container.hasAttribute(`data-canvas-absolute`), descriptors[key]?.absolute || !!container.hasAttribute(`data-canvas-absolute`))
			// console.log(`Measure sticky:`, key, descriptors[key]?.sticky, container.hasAttribute(`data-canvas-sticky`), descriptors[key]?.sticky || !!container.hasAttribute(`data-canvas-sticky`))
	
			return {
				relative: {
					left: _r(getCSSProperty('left', styles)) || 0,
					top: _r(getCSSProperty('top', styles)) || 0,
				},
				extra: descriptors[key]?.extra || container.hasAttribute(`data-canvas-extra`) || false,
				absolute: descriptors[key]?.absolute || container.hasAttribute(`data-canvas-absolute`) || false,
				sticky: descriptors[key]?.sticky || container.hasAttribute(`data-canvas-sticky`) || false,
				resizable: descriptors[key]?.resizable || container.hasAttribute(`data-canvas-resizable`) || false,
				swappable: descriptors[key]?.swappable || container.hasAttribute(`data-canvas-swappable`) || false,
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

	return containerDescriptorCollection
}

export function getElementCSS(element: Element) : CSSStyleDeclaration {
	return window.getComputedStyle(element)
}


export function getCSSProperty(property: string, elementStyleMap: CSSStyleDeclaration): number | undefined {
	const currentProp = elementStyleMap.getPropertyValue(property)

	if(currentProp && currentProp != 'auto') {
		return parseInt(currentProp.toString())
	}

	return undefined
}