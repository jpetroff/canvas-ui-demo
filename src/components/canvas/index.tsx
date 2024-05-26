import './style.css'

import * as React from 'react'

import Scroller from '@components/scroller'

import CanvasContextProvider from './libs/context'

import type { TCanvasContainerElement } from './Container'

import Container from './Container'
import Area from './Area'
import Placeholder from './Placeholder'
import Section from './Section'

import Layout from './Layout'
import Extras from './Extras'


interface ICanvasProps extends React.HTMLProps<HTMLElement> {
	connectors: TConnectorPath[]
	containerCoordinates: IContainerDescriptorCollection
	onLayoutChange: (newLayout: IContainerDescriptorCollection) => void
	moduleSize?: number
	scale?: number
	placeholderDrag?: React.ReactElement
	addMode?: boolean
	onPlaceAdd?: (coords: TContainerDescriptor) => void
}

type NestedComponent<T> = React.FunctionComponent<T> & {
	Container: TCanvasContainerElement
	Section: typeof Section
	Layout: typeof Layout
	Extras: typeof Extras
	Placeholder: typeof Placeholder
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
			<Scroller className="w-full h-full overflow-auto">
				<Area 
					moduleSize={props.moduleSize}
					ref={canvasRef}
					onLayoutChange={props.onLayoutChange}
					onPlaceAdd={props.onPlaceAdd}
				>

					{props.children}
					
				</Area>
			</Scroller>
		</div>
	</CanvasContextProvider>
	)
};

Canvas.Container = Container
Canvas.Section = Section
Canvas.Layout = Layout
Canvas.Extras = Extras
Canvas.Placeholder = Placeholder

Canvas.displayName = 'Canvas'

export default Canvas;