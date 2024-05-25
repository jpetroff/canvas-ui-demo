import { extend, isEqual, transform } from "lodash"
import type { TAreaContext } from "."
import { upscale } from "../libs/utils"


export function recalc(
	measuredContainers: TContainerMeasureDict,
	area: TAreaContext
) : IContainerDescriptorCollection {

	const scale = area.scale

	return transform(
		measuredContainers,
		(result, container, key) => {
			result[key] = {
				extra: container.extra,
				absolute: container.absolute,
				sticky: container.sticky,
				stickTo: container.stickTo,
				resizable: container.resizable,
				width: upscale(container.width, scale),
				height: upscale(container.height, scale)
			}

			if(container.absolute || container.extra) {
				result[key].relative = {
					left: upscale(container.offset.left, scale),
					top: upscale(container.offset.top, scale)
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