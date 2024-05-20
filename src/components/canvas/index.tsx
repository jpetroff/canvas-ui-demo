import './style.css'

import * as React from 'react'
import { clone, defaults, defer, extend, find, findIndex, isEqual, isFunction, map, mapValues, omit, each } from 'lodash'

import Container, { ICanvasContainerProps } from './container'
import type { TCanvasContainerElement } from './container'
import Area, { DragEventStage, IContainerDragEvent} from './area'
import Scroller from '@components/scroller'
import LayoutEngine from './libs/layout'
import { LAYOUT_RULE } from './types'
import type { TConnectorDescription, TConnectorDescriptionList, TContainerCoordCollection } from './types'
import Placeholder from './placeholder'
import Connector from './connector'
import Section from './section'



interface ICanvasProps extends React.HTMLProps<HTMLElement> {
	containers: React.ReactElement<TCanvasContainerElement>[]
	containerCoordinates: TContainerCoordCollection
	connectors: TConnectorDescriptionList
	onLayoutChange: (newLayout: TContainerCoordCollection) => void
	minContainerWidth?: number
	moduleSize?: number
	gap?: number
	layoutWrapperClass?: string
	placeholderDrag?: React.ReactElement
}

type TContainerDragDelta = {
	key: string,
	moduledX: number,
	moduledY: number
}

type NestedComponent<T> = React.FunctionComponent<T> & {
	Container: TCanvasContainerElement
	Section: typeof Section
}

const Canvas: NestedComponent<ICanvasProps> = (_props) => {

	const props = {
		moduleSize: 4,
		minContainerWidth: 4,
		gap: 2,
		placeholderDrag: <Placeholder />,
		layoutWrapperClass: `grid w-2/3 m-auto grid-cols-2 gap-4 p-4 items-start`,
		..._props
	}

	const [isLayoutCalculating, setLayoutCalculating] = React.useState(false)
	const [containerDragKey, setContainerDragKey] = React.useState(null)
	const [connectors, setConnectors] = React.useState(null)

	const canvasRef = React.useRef<HTMLDivElement>(null)
	const layoutRef = React.useRef<HTMLDivElement>(null)
	const extrasRef = React.useRef<HTMLDivElement>(null)
	const connectorsRef = React.useRef<HTMLDivElement>(null)
	const LE = React.useRef(new LayoutEngine())


	LE.current.setOptions({
		moduleSize: props.moduleSize,
		layout: LAYOUT_RULE.css,
		moduleGap: 2
	})

	LE.current.storeCoordsCollection(props.containerCoordinates)

	const containerDragDelta = React.useRef<TContainerDragDelta>(null)
	const containerDragPlaceholderRef = React.useRef(null)

	function updateContainerCoordinates(coordinates: TContainerCoordCollection) {
		if(props.onLayoutChange && isFunction(props.onLayoutChange)) {
			console.log('Update fired')
			props.onLayoutChange(coordinates)
		} else {
			console.warn('Canvas onLayoutChange is not defined as function: cannot save layout changes')
		}
	}

	function onMount() {}

	React.useLayoutEffect( () => {
	// function onMount() {

		console.log('------------------- from effect ----------------')

		const childContainers = [ 
			...Array.from(layoutRef.current.querySelectorAll(`[data-canvas-container]`)), 
			...Array.from(extrasRef.current.querySelectorAll(`[data-canvas-container]`))
		]
		const parentContainerBoundingRects = canvasRef.current.getBoundingClientRect()

		const newContainerCoordCollection = LE.current.calcContainerBoundingRects(
			childContainers as (HTMLElement & TCanvasContainerElement)[], 
			parentContainerBoundingRects.x, 
			parentContainerBoundingRects.y
		)

		// console.log(prevContainerCoordCollection)
		// console.log(newContainerCoordCollection)
		const layoutUnchanged = LE.current.isSameLayout(newContainerCoordCollection)
		console.log(layoutUnchanged)

		if(!layoutUnchanged) {
			// const adjustedCoords = LE.current.calcLayout(newContainerCoordCollection)		
			// LE.current.storeCoordsCollection(newContainerCoordCollection)
			
			updateContainerCoordinates(newContainerCoordCollection)
		}		
	})

	function handleDrag(eventDescriptor: IContainerDragEvent) {
		const moduledX = 	eventDescriptor.dX >= 0 ? 
											Math.floor(eventDescriptor.dX / props.moduleSize) :
											Math.ceil(eventDescriptor.dX / props.moduleSize)
		const moduledY = 	eventDescriptor.dY >= 0 ? 
											Math.floor(eventDescriptor.dY / props.moduleSize) :
											Math.ceil(eventDescriptor.dY / props.moduleSize)

		if(moduledX == 0 && moduledY == 0) return

		if(eventDescriptor.stage == DragEventStage.start) {
			setContainerDragKey(eventDescriptor.key)
		}

		if(eventDescriptor.stage != DragEventStage.end) {

			containerDragDelta.current = {
				key: eventDescriptor.key,
				moduledX,
				moduledY
			}

			LE.current.updateDragPlaceholder(
				eventDescriptor.key, 
				containerDragPlaceholderRef,
				moduledX, moduledY,
				props.containerCoordinates
			)

		} else if( eventDescriptor.stage == DragEventStage.end ) {
			let newContainerCoordinates : TContainerCoordCollection = {}
			console.log('------------------- from drag ----------------')
			each(clone(props.containerCoordinates), (container) => {
				if(
					container.key == eventDescriptor.key
				) {
					console.log(container, moduledX, moduledY)
					container.moduleX += moduledX
					container.moduleY += moduledY
					console.log(container)
				}
				newContainerCoordinates[container.key] = container
			})

			each(newContainerCoordinates, (container) => {
				if (
					container.boundTo == eventDescriptor.key
				) {
					console.log(container, moduledX, moduledY)
					container.parentOffset.x = newContainerCoordinates[eventDescriptor.key].parentOffset.x + LE.current.moduleToPx(newContainerCoordinates[eventDescriptor.key].moduleX)
					container.parentOffset.y = newContainerCoordinates[eventDescriptor.key].parentOffset.y + LE.current.moduleToPx(newContainerCoordinates[eventDescriptor.key].moduleY)
				}
				newContainerCoordinates[container.key] = container
			})

			console.log(moduledX, moduledY)
			console.log(props.containerCoordinates[eventDescriptor.key], newContainerCoordinates[eventDescriptor.key])
			updateContainerCoordinates(newContainerCoordinates)

			LE.current.hideDragContainer(containerDragPlaceholderRef)
			setContainerDragKey(null)
		}
	}

	const createConnectors = () => {
		let result : React.ReactElement[] = []

		map(LE.current.createConnectors(props.connectors, canvasRef), (props) => {
			const {from, to, ...elemProps} = props
			result.push(<Connector {...elemProps} key={`${from}~${to}`} />)
		})
		return result
	}
	React.useLayoutEffect( () => setConnectors(createConnectors()), [props.containerCoordinates, props.connectors] )

	return <div className={`${props.className || ''} w-full h-full overflow-hidden transform-gpu`}>
		{props.moduleSize > 4 && <style>{`:root { --canvas-ui-module-size: ${props.moduleSize}px } `}</style> }
		<Scroller className="w-full h-full overflow-auto">
			<Area 
				moduleSize={props.moduleSize}
				ref={canvasRef}
				isLoading={false}
				onMount={onMount}
				onContainerDrag={handleDrag}
			>
				<div data-canvas-section={`main`} ref={layoutRef} className={`${props.layoutWrapperClass}`}>
					{props.containers.map( 
						(container) => {
							if(!(container.props as ICanvasContainerProps).isExtra)
								return LE.current.prepareElementRender(container, props.containerCoordinates)
						}
					)}
				</div>

				<div data-canvas-section={`extras`} ref={extrasRef} className='absolute top-0 left-0'>
					{props.containers.map( 
						container => (container.props as ICanvasContainerProps).isExtra && LE.current.prepareElementRender(container, props.containerCoordinates)
					)}
				</div>

				<div data-canvas-section={`connectors`} className='absolute top-0 left-0 z-[-1]' ref={connectorsRef}>
					{connectors}
				</div>

				{LE.current.createDragPlaceholder(props.placeholderDrag, containerDragPlaceholderRef)} 
			</Area>
		</Scroller>
	</div>
};

Canvas.Container = Container
Canvas.Section = Section

Canvas.displayName = 'Canvas'

export default Canvas;