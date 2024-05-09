import './style.css'

import * as React from 'react'

import CanvasContainer from './container';
import CanvasArea from './canvas-area';
import defaults from 'lodash/defaults'
import { extend } from 'lodash';

import Scroller from '@components/scroller';


interface ICanvasProps extends React.HTMLProps<HTMLElement> {
	containers?: React.JSX.Element[]
	minContainerWidth?: number
	gridStep?: number
	gap?: number
}

type TCanvasIndex = Array<React.JSX.Element>

interface ICanvasRects {
	[key: string]: {
		top: number
		left: number
		w: number
		h?: number
	}
}

type NestedComponent<T> = React.FunctionComponent<T> & {
	Container: typeof CanvasContainer
}

const Canvas: NestedComponent<ICanvasProps> = (props) => {
	props = defaults(props, {
		gridStep: 16,
		minContainerWidth: 20,
		gap: 2,
		containers: []
	})

	const [containerRects, setContainerRects] = React.useState<ICanvasRects>({})
	const [isLayoutCalculating, setLayoutCalculating] = React.useState(true)
	const canvasRef = React.useRef(null)

	function _calcLayout(index: number, rects: ICanvasRects, containers: TCanvasIndex) {
		console.log('Started index:', index, containers)
		if(index >= 0 && index < containers.length) {
			return { 
				top: (props.gap * props.gridStep),
				left: (props.gridStep * (props.gap * (index+1)  + props.minContainerWidth * index)),
				w: (containers[index].props.w || (props.minContainerWidth * props.gridStep))
			}
		}
	}

	function handleContainerMount() {
		console.log('All mounted')
		console.log(canvasRef.current)
		let rects : ICanvasRects = {}
		props.containers.forEach( (container, index) => {
			_calcLayout(index, rects, )
		})
		setLayoutCalculating(false)
	}	

	console.log('Container rectangles at render:', containerRects);

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
						Container.props.style = { 
							top: (containerRects[Container.key]?.top || 0)+'px',
							left: (containerRects[Container.key]?.left || 0)+'px'
						}
						if(!isLayoutCalculating) {
							// Container.props.style['w'] = containerRects[Container.key].w + 'px'
						}
						return Container
					}
				)}
			</CanvasArea>
		</Scroller>
	</div>
};

Canvas.Container = CanvasContainer

export default Canvas;