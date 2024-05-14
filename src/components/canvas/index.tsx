import './style.css'

import * as React from 'react'
import { clone, defaults, findIndex, isFunction } from 'lodash'

import CanvasContainer from './container'
import CanvasArea, { DragEventStage, IContainerDragEvent} from './canvas-area'
import Scroller from '@components/scroller'
import LayoutEngine from './libs/layout'
import { LAYOUT_RULE } from './libs/types'



interface ICanvasProps extends React.HTMLProps<HTMLElement> {
	containers: React.JSX.Element[]
	containerCoordinates: TCanvasContainerLayout
	onLayoutChange: (newLayout: TCanvasContainerLayout) => void
	minContainerWidth?: number
	moduleSize?: number
	gap?: number
}

export type TCanvasContainerLayout = ICanvasContainerCoords[]

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
		minContainerWidth: 20,
		gap: 2
	})

	const layoutEngine = new LayoutEngine({
		moduleSize: props.moduleSize,
		layout: LAYOUT_RULE.vertical,
		moduleGap: 2
	})

	const [isLayoutCalculating, setLayoutCalculating] = React.useState(true)
	const [contanierDragDelta, setContainerDragDelta] = React.useState<TContainerDragDelta | null>(null)
	const canvasRef = React.useRef<HTMLDivElement>(null)

	function setContainerCoordinates(coordinates: TCanvasContainerLayout) {
		if(props.onLayoutChange && isFunction(props.onLayoutChange)) 
			props.onLayoutChange(coordinates)
	}

	function handleContainerMount() {
		console.log('mounted fired')
		// let newContainerRects : ICanvasContainerLayout = []

		const childContainers = Array.from(canvasRef.current.children)
		const childrenRects = layoutEngine.calcLayout(
			layoutEngine.calcContainerBoundingRects(childContainers)
		)

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
		if(eventDescriptor.stage != DragEventStage.end) {
			setContainerDragDelta({
				key: eventDescriptor.key,
				moduledX,
				moduledY
			})
		} else {
			if(props.onLayoutChange && isFunction(props.onLayoutChange)) {
				const updateContainerCoordinates = clone(props.containerCoordinates)
				const index = findIndex(updateContainerCoordinates, container => container.key == eventDescriptor.key)
				updateContainerCoordinates[index].moduleX += moduledX
				updateContainerCoordinates[index].moduleY += moduledY
				props.onLayoutChange(updateContainerCoordinates)

				setContainerDragDelta(null)
			}
		}
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
				{props.containers.map( (Container, index) => 
					{
						let moduledX = 0
						let moduledY = 0

						if(
							contanierDragDelta != null &&
							Container.key == contanierDragDelta.key
						) {
							moduledX = contanierDragDelta.moduledX
							moduledY = contanierDragDelta.moduledY
						}

						const containerStyle = { 
							left: props.containerCoordinates[index]?.moduleX ? layoutEngine.moduleToCSSStyle(props.containerCoordinates[index].moduleX + moduledX) : undefined,
							top: props.containerCoordinates[index]?.moduleY ? layoutEngine.moduleToCSSStyle(props.containerCoordinates[index].moduleY + moduledY) : undefined,
							width: props.containerCoordinates[index]?.moduleW ? layoutEngine.moduleToCSSStyle(props.containerCoordinates[index].moduleW) : undefined,
							height: props.containerCoordinates[index]?.moduleH ? layoutEngine.moduleToCSSStyle(props.containerCoordinates[index].moduleH) : undefined
						}
						return React.cloneElement(Container, { ...Container.props, style: containerStyle, key: Container.key, dataKey: Container.key}, ...Container.props.children)
					}
				)}
			</CanvasArea>
		</Scroller>
	</div>
};

Canvas.Container = CanvasContainer

export default Canvas;