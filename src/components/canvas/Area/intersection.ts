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

function checkIntersection(
	canvasElement: Element,
	clientX: number, clientY: number,
	containerDescriptorCollection: TContainerDescriptorCollection
) : IntersectionElement[] {
	let result = []
	const _allContainers = canvasElement.querySelectorAll(`[data-canvas-container],[data-canvas-container-section]`)
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
			if(container.getAttribute('data-canvas-container')) features.push(IntersectionObjectType.container)
			if(container.getAttribute('data-canvas-zone')) features.push(IntersectionObjectType.definedZone)
			if(container.getAttribute('data-canvas-section')) features.push(IntersectionObjectType.namedSection)

			if(containerDescriptorCollection[key] && containerDescriptorCollection[key].sticky) 
				features.push(IntersectionObjectType.stickyContainer)

			if(containerDescriptorCollection[key] && containerDescriptorCollection[key].isExtra) 
				features.push(IntersectionObjectType.extraContainer)

			if(containerDescriptorCollection[key] && containerDescriptorCollection[key].isAbsolute) 
				features.push(IntersectionObjectType.absoluteContainer)

			result.push({
				key,
				features
			})
		}
	})

	return result
}

export default checkIntersection