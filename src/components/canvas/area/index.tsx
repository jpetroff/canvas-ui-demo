import './style.css'

import * as React from 'react'

import { useDidMount, useForkRef, useResizeObserver } from '../libs/custom-hooks'
import { isFunction, transform, pick, map, find, indexOf, isEqual } from 'lodash'
import { useCanvasContext, ContextEventType, useCanvasDispatch } from '../libs/context'
import Placeholder from '../Placeholder'
import Connector from '../Connector'
import { createDragPlaceholder, updateDragPlaceholder, hideDragContainer} from './placeholder'
import { stepCoordinates, upscale } from '../libs/utils'
import { checkIntersection, IntersectionObjectType } from './intersection'
import { measureContainers } from './measure'
import { createConnectors } from './connectors'
import { recalc } from './recalc'
import { calcBoundingDimensions, getExtraPaddings, resizeCanvas, setCanvasSize } from './resize'

import { CanvasOrderPositionType, type TCanvasOrderEvent } from '..'

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
	addMode?: boolean
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
	onPlaceAdd?: (coords: TContainerDescriptor) => void
	onOrderChange?: (event: TCanvasOrderEvent) => void
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
		const dimensions = calcBoundingDimensions(selfRef.current, measureContainers(selfRef.current, globalContext.descriptors, globalContext.area))
		const paddings = getExtraPaddings(selfRef.current, dimensions)
		resizeCanvas(selfRef.current, paddings)
		console.log(`Mount paddings:`, paddings, dimensions)
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
		if(props.onMount && isFunction(props.onMount)) props.onMount()
	})

	useResizeObserver(selfRef, () => {
		// const areaRects = selfRef.current.getBoundingClientRect()
		// const dimensions = calcBoundingDimensions(selfRef.current, measureContainers(selfRef.current, globalContext.descriptors, globalContext.area))
		// const paddings = resizeCanvas(selfRef.current, dimensions)
		// updateContext({
		// 	type: ContextEventType.resize,
		// 	value: {
		// 		top: areaRects.top,
		// 		left: areaRects.left,
		// 		width: areaRects.width,
		// 		height: areaRects.height,
		// 		dragObjectKey: null,
		// 		padding: paddings
		// 	}
		// })
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
		console.log(event.target.getAttribute('data-key'), event.target.hasAttribute('data-canvas-container'))
		if(
			event.target.getAttribute &&
			event.target.hasAttribute('data-canvas-container')
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
				const canvas = selfRef.current
				setCanvasSize(canvas, {top: 0, left: 0, right: 9999, bottom: 9999})
				const dragContainer = document.getElementById(`${placeholderId}`)
				const element = selfRef.current.querySelector(`[data-key="${globalContext.area.dragObjectKey}"]`)
				const [dX, dY] = stepCoordinates(event.clientX - mouseDragCoords.X, event.clientY - mouseDragCoords.Y, props.moduleSize, globalContext.area.scale)
				if(dX == 0 || dY == 0) return

				updateDragPlaceholder(
					dX * globalContext.area.scale, 
					dY * globalContext.area.scale,
					element,
					dragContainer,
					selfRef.current
				)
				const dragContainerRect = dragContainer.getBoundingClientRect()
				const canvasRect = canvas.getBoundingClientRect()
				const bottomOut = (canvasRect.bottom - (9999 - canvasRect.top)) - dragContainerRect.bottom
				// if(bottomOut < -12) {
				// 	const scroller = canvas.closest(`[data-canvas-scroller]`)
				// 	scroller.scrollBy(0, 1)
				// 	updateDragPlaceholder(
				// 		dX * globalContext.area.scale, 
				// 		dY * globalContext.area.scale + 1,
				// 		element,
				// 		dragContainer,
				// 		selfRef.current
				// 	)
				// 	// handleDragMove(event)
				// }
			}
	}

	function handleDragEnd(event: MouseTargetEvent<HTMLElement>) {
		if(
			globalContext.area.dragObjectKey != null
		) {
			const [dX, dY] = stepCoordinates(event.clientX - mouseDragCoords.X, event.clientY - mouseDragCoords.Y, props.moduleSize)

			if(dX == 0 || dY == 0) hideDragContainer(document.getElementById(`${placeholderId}`))

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
						container.relative.left = container.relative.left + upscale(dX, globalContext.area.scale)
						container.relative.top = container.relative.top + upscale(dY, globalContext.area.scale)
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
			} else if(newContainerCoordinates[dragObjectKey].swappable) {
				const hitIntersections = checkIntersection(
					selfRef.current,
					event.clientX, event.clientY,
					currentContainers
				)
				const intersection = find(hitIntersections, (hit) => indexOf(hit.features, IntersectionObjectType.container) != -1 )
				const swapObjectKey = intersection ? intersection.key : null

				const isSwappable = swapObjectKey && currentContainers[swapObjectKey].swappable

				console.log(`Swap branch`, isSwappable, swapObjectKey, currentContainers[swapObjectKey])

				if (isSwappable && dragObjectKey != swapObjectKey && props.onOrderChange && isFunction(props.onOrderChange)) {
					props.onOrderChange({
						type: CanvasOrderPositionType.swap,
						objectKey: dragObjectKey,
						placementKey: swapObjectKey
					})
					setDragObjectKey(null)
					hideDragContainer(document.getElementById(`${placeholderId}`))
					return
				}
			}

			updateContainerCoordinates(newContainerCoordinates)
			const dimensions = calcBoundingDimensions(selfRef.current, measureContainers(selfRef.current, globalContext.descriptors, globalContext.area), document.getElementById(`${placeholderId}`))
			const paddings = getExtraPaddings(selfRef.current, dimensions)
			console.log(`Drag paddings:`, paddings, dimensions)
			resizeCanvas(selfRef.current, paddings)
			setDragObjectKey(null)

			hideDragContainer(document.getElementById(`${placeholderId}`))
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
		const newConnectors = map(createConnectors(globalContext.connectors, selfRef.current), (props) => {
			const {from, to, ...elemProps} = props
			return <Connector {...elemProps} key={`${from}~${to}`} />
		})
		if(isEqual(connectorElements, newConnectors)) {
			console.log(`No updates for connectors`)
			return
		}
		setConnectorElements(newConnectors)
	}, [globalContext] )

	function handleClick (event: MouseTargetEvent<HTMLElement>) {
		const canvasRect = selfRef.current.getBoundingClientRect()
		const X = event.clientX - canvasRect.left
		const Y = event.clientY - canvasRect.top
		const scale = globalContext.area.scale

		console.log(`Click`, X, Y)

		const currentContainers = measureContainers(selfRef.current, globalContext.descriptors, globalContext.area)

		const hitIntersections = checkIntersection(
			selfRef.current,
			event.clientX, event.clientY,
			currentContainers
		)

		const intersection = find(hitIntersections, (hit) => indexOf(hit.features, IntersectionObjectType.container) != -1 )
		const boundObjectKey = intersection ? intersection.key : null

		console.log('Bound to', boundObjectKey)

		const parent = 	boundObjectKey ? 
										{
											parent: {
												left: currentContainers[boundObjectKey].offset.left,
												top: currentContainers[boundObjectKey].offset.top,
												width: currentContainers[boundObjectKey].width,
												height: currentContainers[boundObjectKey].height
											},
											stickTo: boundObjectKey
										} :
										{}

		if(props.onPlaceAdd && isFunction(props.onPlaceAdd)) {
			props.onPlaceAdd({
				relative: {
					left: upscale(X, scale),
					top: upscale(Y, scale)
				},
				width: 0,
				height: 0,
				...parent
			})
		}
	}

	const showGridClass =	props.moduleSize > 4 && props.showGrid 
												? 'bg-canvas-ui-grid' : ''

	const dragUserSelectClass = globalContext.area.dragObjectKey != null ? 
															'select-none cursor-grabbing ' : 
															'select-auto cursor-auto'

	const addModeClass = 	globalContext.area.addMode ? 
												'canvas-container-add-mode' :
												''

	console.log(`area debug`, globalContext.area)
	return <div ref={multiRef}
		className={`${props.className || ''} ${dragUserSelectClass} ${showGridClass} ${addModeClass} relative min-w-full min-h-full box-content`}
		onMouseDown={handleDragStart}
		onMouseMove={handleDragMove}
		onMouseUp={handleDragEnd}
		onMouseLeave={handleDragEnd}
		onClick={ globalContext.area.addMode ? handleClick : undefined }
		// style={
		// 	// {
		// 	// 	paddingTop: globalContext.area.padding?.top || 0,
		// 	// 	paddingLeft: globalContext.area.padding?.left || 0,
		// 	// 	paddingBottom: globalContext.area.padding?.bottom || 0,
		// 	// 	paddingRight: globalContext.area.padding?.right || 0,
		// 	// }
		// }
	>
		<div data-canvas-content style={
			{
				transform: globalContext.area.scale < 1 ? `scale(${globalContext.area.scale || 1})` : null,
				transformOrigin: `top left`
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