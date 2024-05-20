import * as React from 'react'

import { useDidMount } from 'rooks'
import { isFunction, defaults } from 'lodash'

export interface MouseTargetEvent<T extends HTMLElement = HTMLElement> extends React.MouseEvent<T, Omit<MouseEvent, 'target'>> { 
	target: EventTarget & Partial<T> 
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
	showGrid?: boolean
	w?: number
	h?: number
	isLoading?: boolean
	onMount?: () => void
	onContainerDrag?: (eventDescriptor: IContainerDragEvent) => void
	onCanvasDrag?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

const Area = React.forwardRef<HTMLDivElement, IAreaProps>((props, ref) => {
	props = defaults(props, {
		isLoading: false,
		showGrid: false
	})

	const [dragObjectKey, setDragObjectKey] = React.useState<string | null>(null)
	const [mouseDragCoords, setMouseDragCoords] = React.useState<{X: number, Y:number}>({X:0,Y:0})

	useDidMount( () => {
		if(props.onMount && isFunction(props.onMount)) props.onMount()
	})

	function handleDragStart(event: MouseTargetEvent<HTMLElement>) {
		if(
			event.target.getAttribute &&
			event.target.getAttribute('data-canvas-container') == 'true' &&
			props.onContainerDrag && 
			isFunction(props.onContainerDrag)
		) {
			props.onContainerDrag({
				stage: DragEventStage.start,
				key: event.target.getAttribute('data-key'),
				event: event,
				dX: 0,
				dY: 0
			})
			setDragObjectKey(event.target.getAttribute('data-key'))
			setMouseDragCoords({
				X: event.clientX,
				Y: event.clientY
			})
		}
	}

	function handleDragMove(event: MouseTargetEvent<HTMLElement>) {
		if(
			dragObjectKey != null && 
			props.onContainerDrag && isFunction(props.onContainerDrag)
	) {
			const { X, Y } = mouseDragCoords
			const dX = event.clientX - X
			const dY = event.clientY - Y
			props.onContainerDrag({
				stage: DragEventStage.move,
				key: dragObjectKey,
				event: event,
				dX,
				dY
			})
		}
	}

	function handleDragEnd(event: MouseTargetEvent<HTMLElement>) {
		if(
			dragObjectKey != null && 
			props.onContainerDrag && isFunction(props.onContainerDrag)
		) {
			const { X, Y } = mouseDragCoords
			const dX = event.clientX - X
			const dY = event.clientY - Y
			props.onContainerDrag({
				stage: DragEventStage.end,
				key: dragObjectKey,
				event: event,
				dX,
				dY
			})
		}
		setDragObjectKey(null)
	}

	const showGridClass = props.moduleSize > 4 && props.showGrid ? 'bg-canvas-ui-grid' : ''

	const dragUserSelectClass = dragObjectKey != null ? 
															'select-none cursor-grabbing children-cursor-grabbing' : 
															'select-auto cursor-auto'
	return <div ref={ref}
		className={`${props.className || ''} ${dragUserSelectClass} ${showGridClass} relative min-w-full min-h-full`}
		onMouseDown={handleDragStart}
		onMouseMove={handleDragMove}
		onMouseUp={handleDragEnd}
		onMouseLeave={handleDragEnd}
	>
		{props.children}
	</div>
});

Area.displayName = 'Canvas.Area'

export default Area;