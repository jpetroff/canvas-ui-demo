/* 
	Renders as child — see https://medium.com/@bryanmylee/aschild-in-react-svelte-vue-and-solid-for-render-delegation-645c73650ced
 */

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
}

const Container = React.forwardRef<HTMLElement, ICanvasContainerProps>((props, ref) => {
	const {
		children, 
		canvasKey, 
		extra, 
		stickTo,
		sticky,
		absolute,
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
	
		containerProps.className = `${containerProps.className || ''} inline-block ${extra || absolute ? 'absolute' : 'relative'} cursor-grab [&_*]:cursor-auto`
		const compositionProps = mergeReactProps(containerProps, children.props)
	
		const currentContext = globalContext.descriptors[props.canvasKey]

		// console.log(`Prerender context`,canvasKey,currentContext)
	
		const fullProps = merge({
			style: {
				top: currentContext?.relative.top ? currentContext.relative.top+'px' : null,
				left: currentContext?.relative.left ? currentContext.relative.left+'px' : null
			},
			key: canvasKey,
			['data-key']: canvasKey,
			['data-canvas-container']: true,
			['data-canvas-absolute']: extra || absolute || currentContext?.extra,
			['data-canvas-stick-to']: currentContext?.stickTo || stickTo || undefined,
			['data-canvas-sticky']: !!sticky || currentContext?.sticky || undefined,
		}, compositionProps)
	
		const childrenProps = {
			...fullProps,
			ref: ref
		}
	
		return React.cloneElement(children, childrenProps as any)
	} catch(err) {
		console.error(err)
	}
});

Container.displayName = 'Canvas.Container'

export type TCanvasContainerElement = typeof Container

export default Container;