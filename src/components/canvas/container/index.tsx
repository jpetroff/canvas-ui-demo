/* 
	Renders as shild — see https://medium.com/@bryanmylee/aschild-in-react-svelte-vue-and-solid-for-render-delegation-645c73650ced
 */

import * as React from 'react'
import { useDidMount } from 'rooks'
import { merge, isFunction } from 'lodash'
import { combinedRef } from '../libs/combined-ref'
import { mergeReactProps } from '../libs/merge-react-props'

interface ICanvasContainerProps extends React.HTMLProps<HTMLElement> {
	dataKey?: string
	top?: number
	left?: number
	w?: number
	h?: number
	onMount?: () => void
	children?: React.ReactElement
}

const CanvasContainer= React.forwardRef<HTMLElement, ICanvasContainerProps>((props, ref) => {
	const {children, ...containerProps} = props

	if (!React.isValidElement(children)) {
		return null;
	}
	
	useDidMount( () => {
		if(containerProps.onMount && isFunction(containerProps.onMount)) 
			containerProps.onMount()
	})

	containerProps.className = `${containerProps.className || ''} inline-block relative cursor-grab [&_*]:cursor-auto`
	const compositionProps = mergeReactProps(containerProps, children.props)
	const compositionRefs = combinedRef([ref, (children as any).ref])

	const fullProps = merge({
		style: {
			top: props.top ? props.top+'px' : null,
			left: props.left ? props.left+'px' : null,
			width: props.w ? props.w+'px' : null,
			height: props.h ? props.h+'px' : null
		},
		['data-key']: containerProps.dataKey,
		['data-canvas-container']: true
	}, compositionProps)

	const childrenProps = {
		...fullProps,
		ref: compositionRefs
	}

	// console.log(childrenProps)
	return React.cloneElement(children, childrenProps as any)
});

export default CanvasContainer;