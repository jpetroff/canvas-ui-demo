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
	top?: number
	left?: number
	w?: number
	h?: number
	onMount?: () => void
	children?: React.ReactNode
	isExtra?: boolean
	isAbsolute?: boolean
	boundTo?: string
	canBound?: boolean
}

const Container = React.forwardRef<HTMLElement, ICanvasContainerProps>((props, ref) => {
	const {
		children, 
		canvasKey, 
		isExtra, 
		boundTo,
		canBound,
		isAbsolute,
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
	
		containerProps.className = `${containerProps.className || ''} inline-block ${isExtra ? 'absolute' : 'relative'} cursor-grab [&_*]:cursor-auto`
		const compositionProps = mergeReactProps(containerProps, children.props)
	
		const currentContext = globalContext.descriptors[props.canvasKey]
	
		const fullProps = merge({
			style: {
				top: currentContext?.relative.top ? currentContext.relative.top+'px' : null,
				left: currentContext?.relative.left ? currentContext.relative.left+'px' : null
			},
			key: canvasKey,
			['data-key']: canvasKey,
			['data-canvas-container']: true,
			['data-canvas-absolute']: isExtra || isAbsolute || currentContext?.isExtra,
			['data-canvas-bound']: currentContext?.boundToContainer || boundTo || undefined,
			['data-canvas-allow-bound']: !!canBound || currentContext?.canBeBound || undefined,
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