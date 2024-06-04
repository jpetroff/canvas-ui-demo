import { cloneDeep, extend, transform } from "lodash"
import type { TAreaContext } from "."
import { upscale } from "../libs/utils"
import { TCanvasContextState } from "../libs/context"


export function recalc(
	measuredContainers: TContainerMeasureDict,
	context: TCanvasContextState
) : IContainerDescriptorCollection {

	const scale = context.area.scale

	console.log(`Context on recalc`, cloneDeep(context.descriptors))

	return transform(
		measuredContainers,
		(result, container, key: string) => {
			result[key] = {
				extra: container.extra,
				absolute: container.absolute,
				sticky: container.sticky,
				stickTo: container.stickTo,
				resizable: container.resizable,
				swappable: container.swappable,
				width: upscale(container.width, scale),
				height: upscale(container.height, scale)
			}

			if(container.absolute || container.extra) {
				result[key].relative = {
					left: container.relative.left,
					top: container.relative.top
				}
			} else {
				// relative CSS value doesn't require upscale
				result[key].relative = {
					left: container.relative.left,
					top: container.relative.top
				}
			}

			if(result[key].stickTo && measuredContainers[result[key].stickTo]) {
				const parentKey = result[key].stickTo
				result[key].parent = {
					left: upscale(measuredContainers[parentKey].offset.left, scale),
					top: upscale(measuredContainers[parentKey].offset.top, scale),
					width: upscale(measuredContainers[parentKey].width, scale),
					height: upscale(measuredContainers[parentKey].height, scale),
				}
			}

			return result
		},
		{}
	)
}

export function recalcContainerParent(
	stickyContainer: TContainerDescriptor, 
	parentContainer: TContainerDescriptor
) : TContainerDescriptor {
	const result = extend({}, stickyContainer)

	if(!parentContainer) return result

	const currentParent = stickyContainer.parent

	if(!currentParent) {
		result.parent = {
			left: parentContainer.relative.left,
			top: parentContainer.relative.top,
			width: parentContainer.width,
			height: parentContainer.height
		}

		return result
	}

	if(
		currentParent.left != parentContainer.relative.left || 
		currentParent.top != parentContainer.relative.top || 
		currentParent.width != parentContainer.width || 
		currentParent.height != parentContainer.height
	) {

	}
}

export const publicHelpers = {

	swapContainerCoordinates: function(
		containers: IContainerDescriptorCollection, key1: string, key2: string
	) : IContainerDescriptorCollection 
	{
		const result = cloneDeep(containers)

		if(!containers[key1] || !containers[key2]) {
			console.warn(`Containers not available:`, key1, key2)
			return result
		}

		if (containers[key1].absolute != containers[key2].absolute) {
			console.warn(`Cannot swap containers with different position type (absolute and relative):`, key1, key2)
			return result
		}

		result[key1].relative = containers[key2].relative
		result[key2].relative = containers[key1].relative

		return result
	}

}