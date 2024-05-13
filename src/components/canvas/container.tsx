import * as React from 'react'
import { useDidMount } from 'rooks'
import { isFunction } from 'lodash'

interface ICanvasContainerProps extends React.HTMLProps<HTMLElement> {
	key: string
	top?: number
	left?: number
	w?: number
	onMount?: () => void
	children?: React.ReactNode
	style?: React.StyleHTMLAttributes<Element>
}

const CanvasContainer: React.FunctionComponent<ICanvasContainerProps> = (props) => {
	useDidMount( () => {
		if(props.onMount && isFunction(props.onMount)) 
			props.onMount()
	})

	console.log(props.style)

	return <div 
		className={`${props.className || ''} absolute ring-1 ring-offset-0 ring-slate-100 box-border rounded-lg bg-white`}
		style={props.style}
	>
		{props.children}
	</div>
};

export default CanvasContainer;