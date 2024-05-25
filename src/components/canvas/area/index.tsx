import * as React from 'react'

import { useDidMount, useForkRef, useResizeObserver, useMutationObserver } from '../libs/custom-hooks'
import { isFunction, transform, pick, map, find, indexOf, isEqual } from 'lodash'
import { useCanvasContext, ContextEventType, TCanvasContextState, useCanvasDispatch } from '../libs/context'
import Placeholder from '../Placeholder'
import Connector from '../Connector'
import { createDragPlaceholder, updateDragPlaceholder, hideDragContainer} from './placeholder'
import { stepCoordinates, upscale } from '../libs/utils'
import { checkIntersection, IntersectionObjectType } from './intersection'
import { measureContainers } from './measure'
import { createConnectors } from './connectors'
import { recalc } from './recalc'

export interface MouseTargetEvent<T extends HTMLElement = HTMLElement> extends React.MouseEvent<T, Omit<MouseEvent, 'target'>> { 
	target: EventTarget & Partial<T> 
}

export type TAreaContext = {
	top?: number
	left?: number
	height?: number
	width?: number
	scale: number
	dragObjectKey?: string | null
	padding: {
		top: number,
		left: number,
		right: number,
		bottom: number
	}
}

export enum DragEventStage {
	start = 'start',
	move = 'move',
	end = 'end'
}

export interface IContainerDragEvent {
	stage: DragEventStage
	key: string
	event: MouseTargetEvent<HTMLElement>
	dX: number
	dY: number
}

export interface IAreaProps extends React.HTMLProps<HTMLDivElement> {
	moduleSize: number
	placeholderElement?: React.ReactElement
	showGrid?: boolean
	onMount?: () => void
	onLayoutChange?: (newLayout: IContainerDescriptorCollection) => void
}

const Area = React.forwardRef<HTMLDivElement, IAreaProps>((props, ref) => {

	const [mouseDragCoords, setMouseDragCoords] = React.useState<{X: number, Y:number}>({X:0,Y:0})

	const globalContext = useCanvasContext()
	const updateContext = useCanvasDispatch()

	const selfRef = React.useRef<HTMLDivElement>(null)

	const multiRef = useForkRef(ref, selfRef)

	const connectorsRef = React.useRef(null)

	const [connectorElements, setConnectorElements] = React.useState([])

	const placeholderId = React.useId()
	const placeholderElement = props.placeholderElement || <Placeholder />

	function setDragObjectKey(key: string) {
		updateContext({
			type: ContextEventType.resize,
			value: {
				dragObjectKey: key
			}
		})
	}

	useDidMount( () => {
		console.log('------------------- from mount ----------------')
		console.log(globalContext, updateContext, selfRef)
		const areaRects = selfRef.current.getBoundingClientRect()
		updateContext({
			type: ContextEventType.resize,
			value: {
				top: areaRects.top,
				left: areaRects.left,
				width: areaRects.width,
				height: areaRects.height,
				dragObjectKey: null,
			}
		})
		if(props.onMount && isFunction(props.onMount)) props.onMount()
	})

	// function recalcLayout(): TContainerDescriptorCollection | null {
	// 	const childContainers = [ 
	// 	...Array.from(selfRef.current.querySelectorAll(`[data-canvas-container]`)), 
	// 	] as (HTMLElement & TCanvasContainerElement)[]

	// 	const currentBoundingRects = LE.calcBoundingRects(childContainers)

	// 	const newContainerDescriptorCollection = LE.calcLayout(
	// 		currentBoundingRects,
	// 		globalContext.descriptors
	// 	)

	// 	console.log(globalContext.descriptors, newContainerDescriptorCollection)

	// 	const layoutChanged = LE.needLayoutUpdate(
	// 		globalContext.descriptors, newContainerDescriptorCollection
	// 	)
  //   console.log(layoutChanged)

	// 	return layoutChanged ? newContainerDescriptorCollection : null
	// }

	// React.useLayoutEffect( () => {
  //   console.log('------------------- from effect ----------------')
	// 	if(!globalContext.area.height || !globalContext.area.width) {
	// 		console.log(`Skip update when area not initialized`)
	// 		return
	// 	}
  //   const newContainerDescriptorCollection = recalcLayout()
  //   if(newContainerDescriptorCollection !== null) {
  //    updateContainerCoordinates(newContainerDescriptorCollection)
  //   }
  // }, [globalContext])

	useResizeObserver(selfRef, () => {
		const areaRects = selfRef.current.getBoundingClientRect()
		updateContext({
			type: ContextEventType.resize,
			value: {
				top: areaRects.top,
				left: areaRects.left,
				width: areaRects.width,
				height: areaRects.height,
				dragObjectKey: null
			}
		})
    // const newContainerDescriptorCollection = recalcLayout()
    // if(newContainerDescriptorCollection !== null) {
		// 	console.log('------------------- from resize ----------------')
    // 	updateContainerCoordinates(newContainerDescriptorCollection)
    // }
	})

	function updateContainerCoordinates(newContainerDescriptorCollection: TContainerMeasureDict) {
		console.log('Update fired', newContainerDescriptorCollection)
		console.log(`Measured containers`, newContainerDescriptorCollection)
		if(props.onLayoutChange && isFunction(props.onLayoutChange)) {
			const updatedProps = recalc(newContainerDescriptorCollection, globalContext.area)
			console.log(`Updated props for containers`, updatedProps)
			props.onLayoutChange(updatedProps)
		} else {
			console.warn('Canvas onLayoutChange is not defined as function: cannot save layout changes')
		}
	}


	function handleDragStart(event: MouseTargetEvent<HTMLElement>) {
		if(
			event.target.getAttribute &&
			event.target.getAttribute('data-canvas-container') == 'true'
		) {
			setDragObjectKey(event.target.getAttribute('data-key'))
			setMouseDragCoords({
				X: event.clientX,
				Y: event.clientY
			})
		}
	}

	function handleDragMove(event: MouseTargetEvent<HTMLElement>) {
		if(
			globalContext.area.dragObjectKey != null
		) {
				const dragContainer = document.getElementById(`${placeholderId}`)
				const element = selfRef.current.querySelector(`[data-key="${globalContext.area.dragObjectKey}"]`)
				const [dX, dY] = stepCoordinates(event.clientX - mouseDragCoords.X, event.clientY - mouseDragCoords.Y, props.moduleSize, globalContext.area.scale)
				updateDragPlaceholder(
					dX, dY,
					element,
					dragContainer,
					globalContext.area
				)
			}
	}

	function handleDragEnd(event: MouseTargetEvent<HTMLElement>) {
		if(
			globalContext.area.dragObjectKey != null
		) {
			const [dX, dY] = stepCoordinates(event.clientX - mouseDragCoords.X, event.clientY - mouseDragCoords.Y, props.moduleSize)

			const dragObjectKey = globalContext.area.dragObjectKey

			console.log(`------------------- from drag: ${dragObjectKey} ----------------`)

			const currentContainers = measureContainers(selfRef.current, globalContext.descriptors, globalContext.area)
			console.log(`Drag measured`, currentContainers)

			const newContainerCoordinates = transform(
				currentContainers, 
				(result, container, key) => {
					if(
						key == dragObjectKey ||
						container.stickTo == dragObjectKey
					) {
						console.log('Updated container', key)
						container.relative.left = upscale(container.relative.left + dX, globalContext.area.scale)
						container.relative.top = upscale(container.relative.top + dY, globalContext.area.scale)
					}
					result[container.key] = container
					return result
			}, {})

			if(newContainerCoordinates[dragObjectKey].sticky) {
				const hitIntersections = checkIntersection(
					selfRef.current,
					event.clientX, event.clientY,
					currentContainers
				)
	
				const intersection = find(hitIntersections, (hit) => indexOf(hit.features, IntersectionObjectType.container) != -1 )
				const boundObjectKey = intersection ? intersection.key : null
	
				console.log('Bound to', boundObjectKey)
	
				if(boundObjectKey) {
					newContainerCoordinates[dragObjectKey].stickTo = boundObjectKey
				} else {
					newContainerCoordinates[dragObjectKey].stickTo = null
				}
			}

			updateContainerCoordinates(newContainerCoordinates)
			hideDragContainer(document.getElementById(`${placeholderId}`))
			setDragObjectKey(null)
		}
	}

	/* 
		useEffect 
		Draws connectors
	*/

	React.useEffect( () => { 
		console.log(`------------------------ from connector effect ------------------------`)
		if(!globalContext.area.height || !globalContext.area.width) {
			console.log(`Skip update when area not initialized`)
			return
		}
		const newConnectors = map(createConnectors(globalContext.connectors, selfRef.current, globalContext.descriptors, globalContext.area.scale), (props) => {
			const {from, to, ...elemProps} = props
			return <Connector {...elemProps} key={`${from}~${to}`} />
		})
		if(isEqual(connectorElements, newConnectors)) {
			console.log(`No updates for connectors`)
			return
		}
		setConnectorElements(newConnectors)
	}, [globalContext] )

	const showGridClass = props.moduleSize > 4 && props.showGrid ? 'bg-canvas-ui-grid' : ''

	const dragUserSelectClass = globalContext.area.dragObjectKey != null ? 
															'select-none cursor-grabbing ' : 
															'select-auto cursor-auto'

	console.log(`area debug`, globalContext.area)
	return <div ref={multiRef}
		className={`${props.className || ''} ${dragUserSelectClass} ${showGridClass} relative min-w-full min-h-full`}
		onMouseDown={handleDragStart}
		onMouseMove={handleDragMove}
		onMouseUp={handleDragEnd}
		onMouseLeave={handleDragEnd}
	>
		<div data-canvas-content style={
			{
				transform: globalContext.area.scale < 1 ? `scale(${globalContext.area.scale || 1}) translate(-${ (1 - globalContext.area.scale) * 100 * globalContext.area.scale }%, -${ (1 - globalContext.area.scale) * 100 * globalContext.area.scale }%)` : null
			}
		}>
			{
				props.children
			}
		</div>

		<div data-canvas-section={`connectors`} className='absolute z-[-1]' ref={connectorsRef}
			style={
				{
					top: globalContext.area.padding.top,
					left: globalContext.area.padding.left,
				}
			}
		>
			{connectorElements}
		</div>

		{createDragPlaceholder(placeholderElement, placeholderId)}
	</div>
});

Area.displayName = 'Canvas.Area'

export default Area;