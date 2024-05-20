import './style.css'

import * as React from 'react'
import { reduce, isFunction, map, each, pick, transform } from 'lodash'

import Scroller from '@components/scroller'

import type { TCanvasContainerElement } from './container'

import Container, { ICanvasContainerProps } from './container'
import Area, { DragEventStage, IContainerDragEvent} from './area'
import LayoutEngine, { LAYOUT_RULE } from './libs/layout'
import Placeholder from './placeholder'
import Connector from './connector'
import Section from './section'


interface ICanvasProps extends React.HTMLProps<HTMLElement> {
	containers: React.ReactElement<TCanvasContainerElement>[]
	containerCoordinates: IContainerDescriptorPropCollection
	connectors: TConnectorPathList
	onLayoutChange: (newLayout: IContainerDescriptorPropCollection) => void
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
		gap: 2,
		placeholderDrag: <Placeholder />,
		layoutWrapperClass: `grid w-2/3 m-auto grid-cols-2 gap-4 p-4 items-start`,
		..._props
	}

	const [isLayoutCalculating, setLayoutCalculating] = React.useState(false)
	const [containerDragKey, setContainerDragKey] = React.useState(null)
	const [connectors, setConnectors] = React.useState(null)
	const [descriptors, setDescriptors] = React.useState(null)

	const canvasRef = React.useRef<HTMLDivElement>(null)
	const layoutRef = React.useRef<HTMLDivElement>(null)
	const extrasRef = React.useRef<HTMLDivElement>(null)
	const connectorsRef = React.useRef<HTMLDivElement>(null)
	const LE = new LayoutEngine()


	LE.setOptions({
		moduleSize: props.moduleSize,
		layout: LAYOUT_RULE.css,
		moduleGap: 2
	})

	// const containerDragDelta = React.useRef<TContainerDragDelta>(null)
	const containerDragPlaceholderRef = React.useRef(null)

	function updateContainerCoordinates(newContainerDescriptorCollection: TContainerDescriptorCollection) {
		console.log('Update fired', newContainerDescriptorCollection)
		setDescriptors(newContainerDescriptorCollection)
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

	function onMount() {}

	React.useLayoutEffect( () => {
		console.log('------------------- from effect ----------------')

		const childContainers = [ 
			...Array.from(layoutRef.current.querySelectorAll(`[data-canvas-container]`)), 
			...Array.from(extrasRef.current.querySelectorAll(`[data-canvas-container]`))
		] as (HTMLElement & TCanvasContainerElement)[]

		// const parentContainerBoundingRects = canvasRef.current.getBoundingClientRect()

		const currentBoundingRects = LE.calcBoundingRects(childContainers)

		const newContainerDescriptorCollection = LE.calcLayout(
			currentBoundingRects,
			props.containerCoordinates
		)

		const layoutChanged = LE.needLayoutUpdate(descriptors, newContainerDescriptorCollection)
		console.log(layoutChanged)

		if(layoutChanged) {
			updateContainerCoordinates(newContainerDescriptorCollection)
		}		
	})

	function handleDrag(eventDescriptor: IContainerDragEvent) {
		const module_dX = 	eventDescriptor.dX >= 0 ? 
											Math.floor(eventDescriptor.dX / props.moduleSize) :
											Math.ceil(eventDescriptor.dX / props.moduleSize)
		const module_dY = 	eventDescriptor.dY >= 0 ? 
											Math.floor(eventDescriptor.dY / props.moduleSize) :
											Math.ceil(eventDescriptor.dY / props.moduleSize)

		if(module_dX == 0 && module_dY == 0) return

		const dX = module_dX * props.moduleSize
		const dY = module_dY * props.moduleSize

		if(eventDescriptor.stage == DragEventStage.start) {
			setContainerDragKey(eventDescriptor.key)
		}

		if(eventDescriptor.stage != DragEventStage.end) {
			LE.updateDragPlaceholder(
				dX, dY,
				eventDescriptor.key, 
				descriptors,
				containerDragPlaceholderRef
			)
		} else if( eventDescriptor.stage == DragEventStage.end ) {
			console.log('------------------- from drag ----------------')
			const newContainerCoordinates = transform(descriptors, 
				(result, _container) => {
					const container = _container
					console.log(_container.key, _container.boundToContainer, eventDescriptor.key)
					if(
						_container.key == eventDescriptor.key ||
						_container.boundToContainer == eventDescriptor.key
					) {
						console.log('Updated container', eventDescriptor.key)
						container.relative.left = container.relative.left + dX
						container.relative.top = container.relative.top + dY
					}
					result[container.key] = container
					return container
				}, {})

				//experimental
				let boundKey = null
				const _allContainers = canvasRef.current.querySelectorAll(`[data-canvas-container]`)
				_allContainers.forEach( (container) => {
					const rects = container.getBoundingClientRect()
					console.log(
						`mouse:`, eventDescriptor.event.clientX,eventDescriptor.event.clientY,
						`container`,  rects.left , rects.top, rects.left + rects.width, rects.top + rects.height,
						container.getAttribute('data-key')
					)
					if(
						(eventDescriptor.event.clientX > rects.left) &&
						(eventDescriptor.event.clientX < rects.left + rects.width) &&
						(eventDescriptor.event.clientY > rects.top ) &&
						(eventDescriptor.event.clientY < rects.top + rects.height) && 
						!container.getAttribute('data-canvas-allow-bound')
					) {
						boundKey = container.getAttribute('data-key')
					}
				})

				console.log(boundKey)

				if(newContainerCoordinates[eventDescriptor.key].canBeBound && boundKey) {
					newContainerCoordinates[eventDescriptor.key].boundToContainer = boundKey
				} else {
					newContainerCoordinates[eventDescriptor.key].boundToContainer = null
				}

				updateContainerCoordinates(newContainerCoordinates)

				LE.hideDragContainer(containerDragPlaceholderRef)
				setContainerDragKey(null)
			}
	}

	const createConnectors = () => {
		let result : React.ReactElement[] = []

		map(LE.createConnectors(props.connectors, canvasRef.current), (props) => {
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
								return LE.prepareElementRender(container, props.containerCoordinates)
						}
					)}
				</div>

				<div data-canvas-section={`extras`} ref={extrasRef} className='absolute top-0 left-0'>
					{props.containers.map( 
						container => (container.props as ICanvasContainerProps).isExtra && LE.prepareElementRender(container, props.containerCoordinates)
					)}
				</div>

				<div data-canvas-section={`connectors`} className='absolute top-0 left-0 z-[-1]' ref={connectorsRef}>
					{connectors}
				</div>

				{LE.createDragPlaceholder(props.placeholderDrag, containerDragPlaceholderRef)} 
			</Area>
		</Scroller>
	</div>
};

Canvas.Container = Container
Canvas.Section = Section

Canvas.displayName = 'Canvas'

export default Canvas;