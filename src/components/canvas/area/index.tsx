import * as React from 'react'

import { useDidMount, useForkRef, useResizeObserver, useMutationObserver } from '../libs/custom-hooks'
import { isFunction, transform, pick, map, find, indexOf, isEqual } from 'lodash'
import { useCanvasContext, useCanvasDispatch, ContextEventType } from '../libs/context'
import LayoutEngine from '../libs/layout-engine'
import Placeholder from '../Placeholder'
import Connector from '../Connector'

import type { TCanvasContainerElement } from '../Container' 
import { stepCoordinates } from '../libs/utils'
import checkIntersection, { IntersectionObjectType } from './intersection'

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
	onLayoutChange?: (newLayout: IContainerDescriptorPropCollection) => void
	// onContainerDrag?: (eventDescriptor: IContainerDragEvent) => void
	// onCanvasDrag?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

const Area = React.forwardRef<HTMLDivElement, IAreaProps>((props, ref) => {

	const [mouseDragCoords, setMouseDragCoords] = React.useState<{X: number, Y:number}>({X:0,Y:0})
	const [areaWidth, setAreaWidth] = React.useState(null)

	const globalContext = useCanvasContext()
	const updateContext = useCanvasDispatch()

	console.log(`→→→→→ Area knows`, globalContext.descriptors)

	const selfRef = React.useRef<HTMLDivElement>(null)

	const multiRef = useForkRef(ref, selfRef)

	const connectorsRef = React.useRef(null)

	const [connectorElements, setConnectorElements] = React.useState([])

	const placeholderId = React.useId()
	const placeholderElement = props.placeholderElement || <Placeholder />

	const LE = new LayoutEngine({
		moduleSize: props.moduleSize || 4
	})

	function setDragObjectKey(key: string) {
		updateContext({
			type: ContextEventType.resize,
			value: {
				dragObjectKey: key
			}
		})
	}

	useDidMount( () => {
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
				padding: globalContext.area.padding
			}
		})
		console.log('------------------- from mount ----------------')
    const newContainerDescriptorCollection = recalcLayout()
    if(newContainerDescriptorCollection !== null) {
     updateContainerCoordinates(newContainerDescriptorCollection)
    }
		if(props.onMount && isFunction(props.onMount)) props.onMount()
	})

	function recalcLayout(): TContainerDescriptorCollection | null {
		const childContainers = [ 
		...Array.from(selfRef.current.querySelectorAll(`[data-canvas-container]`)), 
		] as (HTMLElement & TCanvasContainerElement)[]

		const currentBoundingRects = LE.calcBoundingRects(childContainers)

		const newContainerDescriptorCollection = LE.calcLayout(
			currentBoundingRects,
			globalContext.descriptors
		)

		console.log(globalContext.descriptors, newContainerDescriptorCollection)

		const layoutChanged = LE.needLayoutUpdate(
			globalContext.descriptors, newContainerDescriptorCollection
		)
    console.log(layoutChanged)

		return layoutChanged ? newContainerDescriptorCollection : null
	}

	React.useLayoutEffect( () => {
    console.log('------------------- from effect ----------------')
		if(!globalContext.area.height || !globalContext.area.width) {
			console.log(`Skip update when area not initialized`)
			return
		}
    const newContainerDescriptorCollection = recalcLayout()
    if(newContainerDescriptorCollection !== null) {
     updateContainerCoordinates(newContainerDescriptorCollection)
    }
  }, [globalContext])

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
    const newContainerDescriptorCollection = recalcLayout()
    if(newContainerDescriptorCollection !== null) {
			console.log('------------------- from resize ----------------')
    	updateContainerCoordinates(newContainerDescriptorCollection)
    }
	})

	function updateContainerCoordinates(newContainerDescriptorCollection: TContainerDescriptorCollection) {
		console.log('Update fired', newContainerDescriptorCollection)
		updateContext( {
			type: ContextEventType.replace,
			value: newContainerDescriptorCollection
		})
		if(props.onLayoutChange && isFunction(props.onLayoutChange)) {
			const newPropValue = transform<TContainerDescriptorCollection, IContainerDescriptorPropCollection>(
				newContainerDescriptorCollection, 
				(result, container) => {
					result[container.key] = pick(container, ['relative', 'boundToContainer'])
					return result
				}, 
				{})
			props.onLayoutChange(newPropValue)
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
				const [dX, dY] = stepCoordinates(event.clientX - mouseDragCoords.X, event.clientY - mouseDragCoords.Y, props.moduleSize)
				LE.updateDragPlaceholder(
					dX, dY,
					globalContext.area.dragObjectKey, 
					globalContext.descriptors,
					dragContainer
				)
			}
	}

	function handleDragEnd(event: MouseTargetEvent<HTMLElement>) {
		if(
			globalContext.area.dragObjectKey != null
		) {
			const [dX, dY] = stepCoordinates(event.clientX - mouseDragCoords.X, event.clientY - mouseDragCoords.Y, props.moduleSize)

			const key = globalContext.area.dragObjectKey

			console.log('------------------- from drag ----------------')
			const newContainerCoordinates = transform(globalContext.descriptors, 
				(result, _container) => {
					const container = _container
					if(
						_container.key == key ||
						_container.boundToContainer == key
					) {
						console.log('Updated container', key)
						container.relative.left = container.relative.left + dX
						container.relative.top = container.relative.top + dY
					}
					result[container.key] = container
					return container
			}, {})

			if(newContainerCoordinates[key].canBeBound) {
				const hitIntersections = checkIntersection(
					selfRef.current,
					event.clientX, event.clientY,
					globalContext.descriptors
				)
	
				const intersection = find(hitIntersections, (hit) => indexOf(hit.features, IntersectionObjectType.container) != -1 )
				const boundKey = intersection ? intersection.key : null
	
				console.log('Bound to', boundKey)
	
				if(boundKey) {
					newContainerCoordinates[key].boundToContainer = boundKey
				} else {
					newContainerCoordinates[key].boundToContainer = null
				}
			}

			updateContainerCoordinates(newContainerCoordinates)
			LE.hideDragContainer(document.getElementById(`${placeholderId}`))
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
		const newConnectors = map(LE.createConnectors(globalContext.connectors, selfRef.current), (props) => {
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
		style={
			{
				paddingTop: globalContext.area.padding.top,
				paddingLeft: globalContext.area.padding.left,
				paddingBottom: globalContext.area.padding.bottom,
				paddingRight: globalContext.area.padding.right,
				transform: `scale(${globalContext.area.scale || 1})`
			}
		}
	>
		{
			props.children
		}

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

		{LE.createDragPlaceholder(placeholderElement, placeholderId)}
	</div>
});

Area.displayName = 'Canvas.Area'

export default Area;