/* 
	Renders as child — see https://medium.com/@bryanmylee/aschild-in-react-svelte-vue-and-solid-for-render-delegation-645c73650ced
 */
import './style.css'
import * as React from 'react'
import { useDidMount } from '../libs/custom-hooks'
import { merge, isFunction } from 'lodash'
import { mergeReactProps } from '../libs/merge-react-props'
import { useCanvasContext, useCanvasDispatch } from '../libs/context'



export interface ICanvasContainerProps extends React.HTMLProps<HTMLElement> {
	canvasKey?: string
	onMount?: () => void
	children?: React.ReactNode
	extra?: boolean
	absolute?: boolean
	stickTo?: string
	sticky?: boolean
	swappable?: boolean
	resizable?: boolean
}

const Container = React.forwardRef<HTMLElement, ICanvasContainerProps>((props, ref) => {
	const {
		children, 
		canvasKey, 
		extra, 
		stickTo,
		sticky,
		absolute,
		swappable,
		resizable,
		...containerProps
	} = props

	try {
		const globalContext = useCanvasContext()
	
		if (!React.isValidElement(children)) {
			return null;
		}
		
		useDidMount( () => {
			console.log('Local context', globalContext.descriptors[canvasKey])
			if(containerProps.onMount && isFunction(containerProps.onMount)) 
				containerProps.onMount()
		})

		const selfKey = props.canvasKey
		const dragKey = globalContext.area.dragObjectKey
	
		const lockClass = dragKey ? 'canvas-container-lock' : ''
		const dragOverClass = (!sticky && dragKey && dragKey != selfKey && globalContext.descriptors[dragKey]?.sticky) ? 'canvas-container-drag-over' : ''
		const swapClass = (!sticky && dragKey && dragKey != selfKey && globalContext.descriptors[dragKey]?.swappable && swappable) ? 'canvas-container-swappable' : ''
		containerProps.className = `${containerProps.className || ''} inline-block ${extra || absolute ? 'absolute' : 'relative'} cursor-grab ${lockClass} ${dragOverClass} ${swapClass}`
	
		const currentContext = globalContext.descriptors[props.canvasKey]
	
		const extendProps = {
			ref: ref,
			style: {
				top: currentContext?.relative.top ? currentContext.relative.top+'px' : null,
				left: currentContext?.relative.left ? currentContext.relative.left+'px' : null
			},
			key: canvasKey,
			['data-key']: canvasKey,
			['data-canvas-container']: '',
			['data-canvas-absolute']: (extra || absolute || currentContext?.extra || currentContext?.absolute) ? '' : void 0,
			['data-canvas-stick-to']: currentContext?.stickTo || stickTo || void 0,
			['data-canvas-sticky']: (sticky || currentContext?.sticky) ? '' : void 0,
			['data-canvas-swappable']: (swappable || currentContext?.swappable) ? '' : void 0,
			['data-canvas-resizable']: (resizable || currentContext?.resizable) ? '' : void 0,
		}

		const compositionProps = mergeReactProps(containerProps, children.props, extendProps)

		console.log(compositionProps)
	
		return React.cloneElement(children, compositionProps as any)
	} catch(err) {
		console.error(err)
	}
})

Container.displayName = 'Canvas.Container'

export type TCanvasContainerElement = typeof Container

export default Container;