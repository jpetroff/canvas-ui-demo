import * as React from 'react'
import { useDidMount } from 'rooks'
import { isFunction } from 'lodash'

interface ICanvasContainerProps extends React.HTMLProps<HTMLElement> {
	dataKey?: string
	top?: number
	left?: number
	w?: number
	h?: number
	onMount?: () => void
	children?: React.ReactNode
	style?: React.StyleHTMLAttributes<Element>
}

const CanvasContainer: React.FunctionComponent<ICanvasContainerProps> = (props) => {
	useDidMount( () => {
		if(props.onMount && isFunction(props.onMount)) 
			props.onMount()
	})

	return <div data-canvas-container={true} data-key={props.dataKey}
		className={`${props.className || ''} absolute ring-1 ring-offset-0 ring-slate-100 box-border rounded-lg bg-white cursor-grab [&_*]:cursor-auto`}
		style={props.style}
	>
		{props.children}
	</div>
};

export default CanvasContainer;