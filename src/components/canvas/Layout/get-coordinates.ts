import { cloneDeep, each, head, isNumber, isObject, over, repeat, transform } from "lodash"

export type TOptions = {
	width?: number,
	height?: number,
	adjacent?: Partial<TContainerDescriptor>,
	distance?: number
}

function findOverlap(
	allCoordinates: IContainerDescriptorCollection, 
	rect: {
		top: number, 
		left: number,
		width: number,
		height: number,
	}
) {
	let result = null
	each(
		allCoordinates, 
		(item, key) => {
			if(result != null) return
			if(!item.offset || !item.offset.left || !item.offset.top) return true

			if(
				( item.offset.top > (rect.top + rect.height) ) ||
				( (item.offset.top + (item.height || rect.height) ) < rect.top ) || 
				( item.offset.left > (rect.left + rect.width) ) || 
				( (item.offset.left + (item.width || rect.width ) ) < rect.left )
			) {
				return
			} else {
				result = item
			}
		}
	)

	return result
}

function getAbsoluteCoordinates(
	allCoordinates: IContainerDescriptorCollection,
	options?: TOptions
) : { top: number, left: number } 
{
	const width = options.width || 300
	const height = options.height || 150
	const distance = options.distance || 24

	const hasAdjacent = options.adjacent && isObject(options.adjacent)

	const adjacentBottom = 	(options.adjacent && isNumber(options.adjacent?.offset?.top)) ? 
												options.adjacent.offset.top + (options.adjacent.height || height) : 0
	const adjacentRight = 	(options.adjacent && isNumber(options.adjacent?.offset?.left)) ? 
												options.adjacent.offset.left + (options.adjacent.width || width) : 0

	const adjacentTop = 	options.adjacent && isNumber(options.adjacent?.offset?.top) ? 
												options.adjacent.offset.top : distance

	const adjacentLeft = 	options.adjacent && isNumber(options.adjacent?.offset?.left) ? 
												options.adjacent.offset.left : distance

	//try → 
	let result = {
		top: adjacentTop,
		left: distance + adjacentRight,
	}
	let overlapContainer = findOverlap(
		allCoordinates,
		{
			...result,
			width,
			height
		}
	)

	const leftOverlapContainer = cloneDeep(overlapContainer)

	// if adjacent and bottom has overlap
	// try ↓
	if(
		hasAdjacent && 
		overlapContainer != null
	) {
		result = {
			top: distance + adjacentBottom,
			left: adjacentLeft,
		}
		overlapContainer = findOverlap(
			allCoordinates,
			{
				...result,
				width,
				height
			}	
		)
	}

	if(overlapContainer != null) {
		return getAbsoluteCoordinates(
			allCoordinates,
			{
				width: options.width,
				height: options.height,
				distance: options.distance,
				adjacent: leftOverlapContainer
			}
		)
	} 

	return result
}

export { getAbsoluteCoordinates }