/* 
	Renders as child — see https://medium.com/@bryanmylee/aschild-in-react-svelte-vue-and-solid-for-render-delegation-645c73650ced
 */

import * as React from 'react'
import { useDidMount } from 'rooks'
import { merge, isFunction } from 'lodash'
import { combinedRef } from '../libs/combined-ref'
import { mergeReactProps } from '../libs/merge-react-props'

export interface ICanvasContainerProps extends React.HTMLProps<HTMLElement> {
	canvasKey?: string
	top?: number
	left?: number
	w?: number
	h?: number
	onMount?: () => void
	children?: React.ReactElement
	isExtra?: boolean,
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
		...containerProps
	} = props

	if (!React.isValidElement(children)) {
		return null;
	}
	
	useDidMount( () => {
		if(containerProps.onMount && isFunction(containerProps.onMount)) 
			containerProps.onMount()
	})

	containerProps.className = `${containerProps.className || ''} inline-block ${isExtra ? 'absolute' : 'relative'} cursor-grab [&_*]:cursor-auto`
	const compositionProps = mergeReactProps(containerProps, children.props)

	const fullProps = merge({
		style: {
			top: props.top ? props.top+'px' : null,
			left: props.left ? props.left+'px' : null,
			width: props.w ? props.w+'px' : null,
			height: props.h ? props.h+'px' : null
		},
		key: canvasKey,
		['data-key']: canvasKey,
		['data-canvas-container']: true,
		['data-canvas-absolute']: isExtra,
		['data-canvas-bound']: boundTo || undefined,
		['data-canvas-allow-bound']: !!canBound || undefined,
	}, compositionProps)

	const childrenProps = {
		...fullProps,
		ref: ref
	}

	return React.cloneElement(children, childrenProps as any)
});

Container.displayName = 'Canvas.Container'

export type TCanvasContainerElement = typeof Container

export default Container;