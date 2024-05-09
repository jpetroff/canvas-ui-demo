import * as React from 'react'

import { useDidMount } from 'rooks'
import { isFunction, defaults } from 'lodash'

interface ICanvasAreaProps extends React.HTMLProps<HTMLDivElement> {
	w?: number
	h?: number
	onMount?: () => void
	isLoading?: boolean
}

const CanvasArea = React.forwardRef<HTMLDivElement, ICanvasAreaProps>((props, ref) => {
	props = defaults(props, {
		isLoading: false
	})
	useDidMount( () => {
		if(props.onMount && isFunction(props.onMount)) props.onMount()
	})

	const loadingClass = props.isLoading ? 'opacity-0' : 'opacity-100'
	return <div ref={ref}
		className={`${props.className || ''} ${loadingClass} relative min-w-full min-h-full canvas-ui-bg-dotted`}
	>
		{props.children}
	</div>
});

export default CanvasArea;