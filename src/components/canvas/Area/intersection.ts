import { reduce } from "lodash"

export enum IntersectionObjectType {
	container = 'data-canvas-container',
	stickyContainer = 'data-canvas-allow-bound',
	extraContainer = 'data-canvas-extra',
	definedZone = 'data-canvas-zone',
	absoluteContainer = 'data-canvas-absolute',
	namedSection = 'data-canvas-section'
}

export type IntersectionElement = {
	key: string,
	features: IntersectionObjectType[]
}

export function checkIntersection(
	canvasElement: Element,
	clientX: number, clientY: number,
	containerDescriptorCollection: IContainerDescriptorCollection
) : IntersectionElement[] {
	let result = []
	const _allContainers = canvasElement.querySelectorAll(`[data-canvas-container],[data-canvas-container-zone]`)
	_allContainers.forEach( (container) => {
		const rects = container.getBoundingClientRect()
		if(
			(clientX > rects.left) &&
			(clientX < rects.left + rects.width) &&
			(clientY > rects.top ) &&
			(clientY < rects.top + rects.height)
		) {
			const key = container.getAttribute('data-key')
			
			let features = []
			if(container.hasAttribute('data-canvas-container')) features.push(IntersectionObjectType.container)
			if(container.hasAttribute('data-canvas-zone')) features.push(IntersectionObjectType.definedZone)
			if(container.hasAttribute('data-canvas-section')) features.push(IntersectionObjectType.namedSection)

			if(containerDescriptorCollection[key] && containerDescriptorCollection[key].sticky) 
				features.push(IntersectionObjectType.stickyContainer)

			if(containerDescriptorCollection[key] && containerDescriptorCollection[key].sticky) 
				features.push(IntersectionObjectType.extraContainer)

			if(containerDescriptorCollection[key] && containerDescriptorCollection[key].absolute) 
				features.push(IntersectionObjectType.absoluteContainer)

			result.push({
				key,
				features
			})
		}
	})

	return result
}