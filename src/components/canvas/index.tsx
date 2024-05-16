import './style.css'

import * as React from 'react'
import { clone, defaults, extend, findIndex, isFunction } from 'lodash'

import CanvasContainer from './container'
import CanvasArea, { DragEventStage, IContainerDragEvent} from './area'
import Scroller from '@components/scroller'
import LayoutEngine from './libs/layout'
import { LAYOUT_RULE, ICanvasCoordsCollection } from './types'
import Placeholder from './placeholder'



interface ICanvasProps extends React.HTMLProps<HTMLElement> {
	containers: React.JSX.Element[]
	containerCoordinates: ICanvasCoordsCollection
	onLayoutChange: (newLayout: ICanvasCoordsCollection) => void
	minContainerWidth?: number
	moduleSize?: number
	gap?: number
}

type TContainerDragDelta = {
	key: string,
	moduledX: number,
	moduledY: number
}

type NestedComponent<T> = React.FunctionComponent<T> & {
	Container: typeof CanvasContainer
}

const Canvas: NestedComponent<ICanvasProps> = (_props) => {
	const props = defaults(_props, {
		moduleSize: 16,
		minContainerWidth: 4,
		gap: 2
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

	function setContainerCoordinates(coordinates: ICanvasCoordsCollection) {
		if(props.onLayoutChange && isFunction(props.onLayoutChange)) 
			props.onLayoutChange(coordinates)
	}

	function handleContainerMount() {
		const childContainers = Array.from(layoutRef.current.children)
		const parentContainerBoundingRects = layoutRef.current.getBoundingClientRect()
		const childrenRects = layoutEngine.calcLayout(
			layoutEngine.calcContainerBoundingRects(childContainers, parentContainerBoundingRects.x, parentContainerBoundingRects.y)
		)

		console.log(childrenRects)

		setContainerCoordinates(childrenRects)
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
			console.log({
				key: eventDescriptor.key,
				moduledX,
				moduledY
			})
			setContainerDragDelta({
				key: eventDescriptor.key,
				moduledX,
				moduledY
			})
		} else {
			if(props.onLayoutChange && isFunction(props.onLayoutChange)) {
				const updateContainerCoordinates = clone(props.containerCoordinates)

				updateContainerCoordinates[eventDescriptor.key].moduleX += moduledX
				updateContainerCoordinates[eventDescriptor.key].moduleY += moduledY
				props.onLayoutChange(updateContainerCoordinates)

				setContainerDragDelta(null)
			}
		}
	}

	function getDragDeltaCoords(key: string) {
		if(
			contanierDragDelta != null &&
			key == contanierDragDelta.key
		) {
			return [contanierDragDelta.moduledX, contanierDragDelta.moduledY]
		} else {
			return [0,0]
		}
	}

	function getContainerCoordinateProps(containerCoordinates: ICanvasContainerCoords) {
		if(!containerCoordinates) return {}

		return { 
			left: layoutEngine.moduleToPx(containerCoordinates.moduleX),
			top: layoutEngine.moduleToPx(containerCoordinates.moduleY),
			// w: layoutEngine.moduleToPx(containerCoordinates.moduleW),
			// h: layoutEngine.moduleToPx(containerCoordinates.moduleH)
		}
	}

	function getDragPlaceholder(dX: number, dY: number, containerCoordinates: ICanvasContainerCoords) {
		if(!containerCoordinates) return null
		if(dX == 0 && dY == 0) return null

		return <Placeholder 
			left={layoutEngine.moduleToPx(containerCoordinates.moduleX + dX) + containerCoordinates.parentOffset.x}
			top={layoutEngine.moduleToPx(containerCoordinates.moduleY + dY) + containerCoordinates.parentOffset.y}
			w={layoutEngine.moduleToPx(containerCoordinates.moduleW)}
			h={layoutEngine.moduleToPx(containerCoordinates.moduleH)}
		/>
	}

	return <div className={`${props.className || ''} w-full h-full overflow-hidden transform-gpu`}>
		<style>{`:root { --canvas-ui-module-size: ${props.moduleSize}px } `}</style>
		<Scroller className="w-full h-full overflow-auto">
			<CanvasArea 
				moduleSize={props.moduleSize}
				ref={canvasRef}
				onMount={handleContainerMount} isLoading={isLayoutCalculating}
				onContainerDrag={handleDrag}
			>
				<div ref={layoutRef} className={`grid grid-flow-row gap-4 p-4`}>
					{props.containers.map( (Container, index) => 
						{
							const [module_dX, module_dY] = getDragDeltaCoords(Container.key)
							const currentCoords = props.containerCoordinates[Container.key]

							const newProps = extend(Container.props, getContainerCoordinateProps(currentCoords))

							const dragPlaceholder = getDragPlaceholder(module_dX, module_dY, currentCoords)
							return [
								React.cloneElement(Container, { ...newProps, key: Container.key, dataKey: Container.key}, ...Container.props.children),
								dragPlaceholder
							]
						}
					)}
				</div>
			</CanvasArea>
		</Scroller>
	</div>
};

Canvas.Container = CanvasContainer

export default Canvas;