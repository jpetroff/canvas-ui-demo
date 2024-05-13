import './style.css'

import * as React from 'react'

import defaults from 'lodash/defaults'

import CanvasContainer from './container'
import CanvasArea from './canvas-area'
import Scroller from '@components/scroller'
import LayoutEngine from './libs/layout'
import { LAYOUT_RULE } from './libs/types'



interface ICanvasProps extends React.HTMLProps<HTMLElement> {
	containers?: React.JSX.Element[]
	minContainerWidth?: number
	gridStep?: number
	gap?: number
}

interface ICanvasContainerLayout {
	[key: string]: ICanvasContainerCoords
}

type NestedComponent<T> = React.FunctionComponent<T> & {
	Container: typeof CanvasContainer
}

const Canvas: NestedComponent<ICanvasProps> = (_props) => {
	const props = defaults(_props, {
		gridStep: 16,
		minContainerWidth: 20,
		gap: 2,
		containers: []
	})

	const layoutEngine = new LayoutEngine({
		moduleSize: props.gridStep,
		layout: LAYOUT_RULE.vertical,
		moduleGap: 2
	})

	const [containerRects, setContainerRects] = React.useState<ICanvasContainerLayout>({})
	const [isLayoutCalculating, setLayoutCalculating] = React.useState(true)
	const canvasRef = React.useRef<HTMLDivElement>(null)


	function handleContainerMount() {
		console.log('mounted fired')
		let newContainerRects : ICanvasContainerLayout = {}

		const childContainers = Array.from(canvasRef.current.children)
		const childrenRects = layoutEngine.calcLayout(
			layoutEngine.calcContainerBoundingRects(childContainers)
		)

		childrenRects.map( (element, index) => {
			newContainerRects[props.containers[index].key] = element
		})

		setContainerRects(newContainerRects)
		setLayoutCalculating(false)
	}

	return <div 
		className={`
			${props.className || ''} w-full h-full overflow-hidden transform-gpu
		`}
	>
		<style>
			{`:root {
				--canvas-ui-grid-step: ${props.gridStep}px;
			}`}
		</style>
		<Scroller className="w-full h-full overflow-auto">
			<CanvasArea ref={canvasRef} onMount={handleContainerMount} isLoading={isLayoutCalculating}>
				{props.containers.map( (Container) => 
					{
						const containerStyle = { 
							top: containerRects[Container.key]?.moduleY ? layoutEngine.moduleToCSSStyle(containerRects[Container.key].moduleY) : undefined,
							left: containerRects[Container.key]?.moduleX ? layoutEngine.moduleToCSSStyle(containerRects[Container.key].moduleX) : undefined,
							width: containerRects[Container.key]?.moduleW ? layoutEngine.moduleToCSSStyle(containerRects[Container.key].moduleW) : undefined,
							height: containerRects[Container.key]?.moduleH ? layoutEngine.moduleToCSSStyle(containerRects[Container.key].moduleH) : undefined
						}
						return React.cloneElement(Container, { ...Container.props, style: containerStyle}, ...Container.props.children)
					}
				)}
			</CanvasArea>
		</Scroller>
	</div>
};

Canvas.Container = CanvasContainer

export default Canvas;