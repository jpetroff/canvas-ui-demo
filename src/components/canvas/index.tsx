import './style.css'

import * as React from 'react'
import { clone, defaults, extend, find, findIndex, isFunction, map, mapValues } from 'lodash'

import CanvasContainer, { ICanvasContainerProps } from './container'
import type { TCanvasContainerElement } from './container'
import CanvasArea, { DragEventStage, IContainerDragEvent} from './area'
import Scroller from '@components/scroller'
import LayoutEngine from './libs/layout'
import { LAYOUT_RULE, ICanvasCoordsCollection } from './types'
import Placeholder from './placeholder'
import Connector from './connector'



interface ICanvasProps extends React.HTMLProps<HTMLElement> {
	containers: React.ReactElement<TCanvasContainerElement>[]
	containerCoordinates: ICanvasCoordsCollection
	onLayoutChange: (newLayout: ICanvasCoordsCollection) => void
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
}

const Canvas: NestedComponent<ICanvasProps> = (_props) => {
	const props = defaults(_props, {
		moduleSize: 4,
		minContainerWidth: 4,
		gap: 2,
		placeholderDrag: <Placeholder />,
		layoutWrapperClass: `grid w-2/3 m-auto grid-cols-2 gap-4 p-4 items-start`
	})

	const layoutEngine = new LayoutEngine({
		moduleSize: props.moduleSize,
		layout: LAYOUT_RULE.css,
		moduleGap: 2
	})

	const [isLayoutCalculating, setLayoutCalculating] = React.useState(true)
	const [contanierDragDelta, setContainerDragDelta] = React.useState<TContainerDragDelta | null>(null)
	const canvasRef = React.useRef<HTMLDivElement>(null)
	const layoutRef = React.useRef<HTMLDivElement>(null)
	const extrasRef = React.useRef<HTMLDivElement>(null)
	const connectorsRef = React.useRef<HTMLDivElement>(null)

	function updateContainerCoordinates(coordinates: ICanvasCoordsCollection) {
		if(props.onLayoutChange && isFunction(props.onLayoutChange)) 
			props.onLayoutChange(coordinates)
	}

	function handleContainerMount() {
		const childContainers = [ ...Array.from(layoutRef.current.children), ...Array.from(extrasRef.current.children) ]
		const parentContainerBoundingRects = canvasRef.current.getBoundingClientRect()

		const childrenRects = layoutEngine.calcLayout(
			layoutEngine.calcContainerBoundingRects(
				childContainers as (HTMLElement & TCanvasContainerElement)[], 
				parentContainerBoundingRects.x, 
				parentContainerBoundingRects.y
			)
		)

		updateContainerCoordinates(childrenRects)
		setLayoutCalculating(false)
	}

	function handleDrag(eventDescriptor: IContainerDragEvent) {
		const moduledX = 	eventDescriptor.dX >= 0 ? 
											Math.floor(eventDescriptor.dX / props.moduleSize) :
											Math.ceil(eventDescriptor.dX / props.moduleSize)
		const moduledY = 	eventDescriptor.dY >= 0 ? 
											Math.floor(eventDescriptor.dY / props.moduleSize) :
											Math.ceil(eventDescriptor.dY / props.moduleSize)

		if(moduledX == 0 && moduledY == 0) return

		if(eventDescriptor.stage != DragEventStage.end) {

			setContainerDragDelta({
				key: eventDescriptor.key,
				moduledX,
				moduledY
			})

		} else {

			if(props.onLayoutChange && isFunction(props.onLayoutChange)) {

				const updateContainerCoordinates = mapValues(props.containerCoordinates, (container) => {
					if(
						container.key == eventDescriptor.key
					) {
						container.moduleX += moduledX
						container.moduleY += moduledY
					} else if (
						container.boundTo == eventDescriptor.key
					) {
						container.parentOffset.x += layoutEngine.moduleToPx(moduledX)
						container.parentOffset.y += layoutEngine.moduleToPx(moduledY)
					}
					return container
				})
				props.onLayoutChange(updateContainerCoordinates)
				
			} else {
				console.warn('Canvas onLayoutChange is not defined as function: cannot save layout changes')
			}

			setContainerDragDelta(null)
		}
	}

	return <div className={`${props.className || ''} w-full h-full overflow-hidden transform-gpu`}>
		{props.moduleSize > 4 && <style>{`:root { --canvas-ui-module-size: ${props.moduleSize}px } `}</style> }
		<Scroller className="w-full h-full overflow-auto">
			<CanvasArea 
				moduleSize={props.moduleSize}
				ref={canvasRef}
				onMount={handleContainerMount} isLoading={isLayoutCalculating}
				onContainerDrag={handleDrag}
			>
				<div data-canvas-section={`main`} ref={layoutRef} className={`${props.layoutWrapperClass}`}>
					{props.containers.map( 
						container => !(container.props as ICanvasContainerProps).isExtra && layoutEngine.prepareElementRender(container, props.containerCoordinates)
					)}
				</div>

				<div data-canvas-section={`extras`} ref={extrasRef} className='absolute top-0 left-0'>
					{props.containers.map( 
						container => (container.props as ICanvasContainerProps).isExtra && layoutEngine.prepareElementRender(container, props.containerCoordinates)
					)}
				</div>

				<div data-canvas-section={`connectors`} className='absolute top-0 left-0 z-[-1]' ref={connectorsRef}>
					{
						contanierDragDelta == null && map(layoutEngine.createConnectors(props.containerCoordinates), (props) => {
							return <Connector {...props} />
						}) 
					}
				</div>

				{
					contanierDragDelta != null &&
					props.containerCoordinates[contanierDragDelta.key] && 
					layoutEngine.createDragPlaceholder(
						props.placeholderDrag,
						contanierDragDelta.moduledX, 
						contanierDragDelta.moduledY, 
						contanierDragDelta.key, 
						props.containerCoordinates
					)
				} 
			</CanvasArea>
		</Scroller>
	</div>
};

Canvas.Container = CanvasContainer

export default Canvas;