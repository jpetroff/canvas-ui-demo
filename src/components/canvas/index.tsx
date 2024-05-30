import './style.css'

import * as React from 'react'

import CanvasContextProvider from './libs/context'

import type { TCanvasContainerElement } from './Container'

import Container from './Container'
import Area from './Area'
import Placeholder from './Placeholder'
import Section from './Section'
import Scroller from './Scroller'

import Layout from './Layout'
import Extras from './Extras'
import { publicHelpers as recalcHelpers } from './Area/recalc'

export enum CanvasOrderPositionType {
	after = 'after',
	before = 'before',
	swap = 'swap' 
}

export type TCanvasOrderEvent =
{
	type: CanvasOrderPositionType
	objectKey: string
	placementKey: string
	zoneKey?: string
}


interface ICanvasProps extends React.HTMLProps<HTMLElement> {
	connectors: TConnectorPath[]
	containerCoordinates: IContainerDescriptorCollection
	moduleSize?: number
	scale?: number
	dragPlaceholder?: React.ReactElement
	scroll?: React.ReactElement
	addMode?: boolean

	onLayoutChange: (newLayout: IContainerDescriptorCollection) => void
	onPlaceAdd?: (coords: TContainerDescriptor) => void
	onOrderChange?: (event: TCanvasOrderEvent) => void
}

type NestedComponent<T> = React.FunctionComponent<T> & {
	Container: TCanvasContainerElement
	Section: typeof Section
	Layout: typeof Layout
	Extras: typeof Extras
	Placeholder: typeof Placeholder
	Scroller: typeof Scroller
}

const Canvas: NestedComponent<ICanvasProps> = (_props) => {

	const props = {
		moduleSize: 4,
		gap: 2,
		placeholderDrag: <Placeholder />,
		..._props
	}
	const canvasRef = React.useRef<HTMLDivElement>(null)

	console.log(`→→→→→ props passed`, props.containerCoordinates)

	const areaScale = (props.scale >= 0.5 && props.scale <= 1) ? props.scale : 1

	return (
	<CanvasContextProvider 
		area={
			{	dragObjectKey: null,
				addMode: props.addMode,
				scale: areaScale,
				padding: {
					top: 0,
					bottom: 0,
					left: 0,
					right: 0
				}
			}
		}
		descriptors={props.containerCoordinates}
		connectors={props.connectors}
	>
		<div className={`${props.className || ''} w-full h-full overflow-hidden transform-gpu`}>
		{props.moduleSize > 4 && <style>{`:root { --canvas-ui-module-size: ${props.moduleSize}px } `}</style> }
			{
				React.cloneElement(
					props.scroll || <Scroller />,
					{ ...props.scroll.props, className: 'w-full h-full'},
					<Area 
						moduleSize={props.moduleSize}
						ref={canvasRef}
						onLayoutChange={props.onLayoutChange}
						onPlaceAdd={props.onPlaceAdd}
						onOrderChange={props.onOrderChange}
					>

						{props.children}
						
					</Area>
				)
			}
		</div>
	</CanvasContextProvider>
	)
};

Canvas.Container = Container
Canvas.Section = Section
Canvas.Layout = Layout
Canvas.Extras = Extras
Canvas.Placeholder = Placeholder
Canvas.Scroller = Scroller

Canvas.displayName = 'Canvas'

export default Canvas

export const swapContainerCoordinates = recalcHelpers.swapContainerCoordinates