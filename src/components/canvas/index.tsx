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

	return (
	<CanvasContextProvider value={
		{
			descriptors: props.containerCoordinates,
			connectors: props.connectors,
			area: {}
		}
	} >
		<div className={`${props.className || ''} w-full h-full overflow-hidden transform-gpu`}>
		{props.moduleSize > 4 && <style>{`:root { --canvas-ui-module-size: ${props.moduleSize}px } `}</style> }
			<Scroller className="w-full h-full overflow-auto">
				<Area 
					moduleSize={props.moduleSize}
					ref={canvasRef}
					onLayoutChange={props.onLayoutChange}
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