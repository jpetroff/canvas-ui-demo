import * as React from 'react'

import useCustomCompareEffect, { useDidMount, useForkRef, useResizeObserver, useMutationObserver } from '../libs/custom-hooks'
import { isFunction, transform, pick, map, find, indexOf, isEqual } from 'lodash'
import { useCanvasContext, useCanvasDispatch, ContextEventType } from '../libs/context'
import LayoutEngine from '../libs/layout-engine'
import Placeholder from '../Placeholder'
import Connector from '../Connector'

import type { TCanvasContainerElement } from '../Container' 
import { _r, stepCoordinates } from '../libs/utils'
import checkIntersection, { IntersectionObjectType } from './intersection'

export interface MouseTargetEvent<T extends HTMLElement> extends React.MouseEvent<T, Omit<MouseEvent, 'target'>> { 
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

	const [mouseDragCoords, setMouseDragCoords] = React.useState<{X: number, Y:number, objectTop: number, objectLeft: number}>({X:0,Y:0,objectTop:0,objectLeft:0})

	const globalContext = useCanvasContext()
	const updateContext = useCanvasDispatch()

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
		console.log('------------------- from area effect ----------------')
	})

	useResizeObserver(selfRef, () => {
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
		console.log('------------------- from area resize ----------------')
	})

	React.useEffect( () => {
		if(props.onLayoutChange && isFunction(props.onLayoutChange)) {
			console.log(`App update area effect descriptors`, globalContext.descriptors)
			const newPropValue = transform<TContainerDescriptorCollection, IContainerDescriptorPropCollection>(
				globalContext.descriptors, 
				(result, container) => {
					result[container.key] = pick(container, ['relative', 'boundToContainer'])
					return result
				}, 
				{})
			console.log(`App update area effect`, newPropValue)
			props.onLayoutChange(newPropValue)
		}
	}, 
		[globalContext]
	// , 
	// 	(prevDependencies, newDependencies) => {
	// 		const prevLayout = prevDependencies[0]
	// 		const newLayout = newDependencies[0]
	// 		const newPropValue = transform<TContainerDescriptorCollection, IContainerDescriptorPropCollection>(
	// 			newLayout, 
	// 			(result, container) => {
	// 				console.log(container)
	// 				result[container.key] = pick(container, ['relative', 'boundToContainer'])
	// 				return result
	// 			}, 
	// 			{})

	// 		const prevPropValue = transform<TContainerDescriptorCollection, IContainerDescriptorPropCollection>(
	// 			prevLayout, 
	// 			(result, container) => {
	// 				if(!container || !container.key || container.key == 'undefined') return
	// 				result[container.key] = pick(container, ['relative', 'boundToContainer'])
	// 				return result
	// 			}, 
	// 			{})

	// 		console.log('↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓')
	// 		console.log('custom compare effect', newPropValue, prevPropValue, isEqual(newPropValue, prevPropValue))
	// 		console.log('↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑')

	// 		return isEqual(newPropValue, prevPropValue)
	// 	} 
	)


	function handleDragStart(event: MouseTargetEvent<HTMLElement>) {
		if(
			event.target.getAttribute &&
			event.target.getAttribute('data-canvas-container') == 'true'
		) {
			console.log(`Drag start`, event.target.getAttribute('data-key'))
			const targetRects = event.target.getBoundingClientRect()
			setDragObjectKey(event.target.getAttribute('data-key'))
			setMouseDragCoords({
				X: event.clientX,
				Y: event.clientY,
				objectTop: targetRects.top - globalContext.area.top,
				objectLeft: targetRects.left - globalContext.area.left,
			})
			console.log(`Init coords`, event.target.getAttribute('data-key'), targetRects.top - globalContext.area.top, targetRects.left - globalContext.area.left)
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
					selfRef.current.querySelector(`[data-key="${globalContext.area.dragObjectKey}"]`),
					dragContainer,
					selfRef.current
				)
			}
	}

	function handleDragEnd(event: MouseTargetEvent<HTMLDivElement>) {
		if(
			globalContext.area.dragObjectKey != null
		) {
			const [dX, dY] = stepCoordinates(event.clientX - mouseDragCoords.X, event.clientY - mouseDragCoords.Y, props.moduleSize)

			if(dX == 0 || dY == 0) return

			const key = globalContext.area.dragObjectKey

			console.log('------------------- from drag ----------------')


			console.log('end drag', key, dX, dY, mouseDragCoords.objectLeft, mouseDragCoords.objectTop)

			const newContainerValue = {
				type: ContextEventType.patch,
				key,
				value: {
					top: _r(mouseDragCoords.objectTop + dY) / globalContext.area.scale,
					left: _r(mouseDragCoords.objectLeft + dX) / globalContext.area.scale
				}
			}

			console.log('Update fired for ', key, newContainerValue)
			updateContext( newContainerValue )
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
		const newConnectors = map(LE.createConnectors(globalContext.connectors, selfRef.current, globalContext.descriptors), (props) => {
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

	
	let topShift = 0
	let leftShift = 0
	if(globalContext.area?.height && globalContext.area?.height) {
		topShift = (globalContext.area.height - globalContext.area.height * globalContext.area.scale) / 2
		leftShift = (globalContext.area.width - globalContext.area.width * globalContext.area.scale) / 2
	}

	return <div ref={multiRef}
		className={`${props.className || ''} ${dragUserSelectClass} ${showGridClass} relative min-w-full min-h-full`}
		onMouseDown={handleDragStart}
		onMouseMove={handleDragMove}
		onMouseUp={handleDragEnd}
		onMouseLeave={handleDragEnd}
	>
		<div data-canvas-content style={
			{
				transform: globalContext.area.scale < 1 ? 
					`scale(${globalContext.area.scale || 1})` 
					: null
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

		{LE.createDragPlaceholder(placeholderElement, placeholderId)}
	</div>
});

Area.displayName = 'Canvas.Area'

export default Area;