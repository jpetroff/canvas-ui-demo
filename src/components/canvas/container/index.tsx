/* 
	Renders as child — see https://medium.com/@bryanmylee/aschild-in-react-svelte-vue-and-solid-for-render-delegation-645c73650ced
 */

import * as React from 'react'
import useCustomCompareEffect, { useDidMount, useForkRef, useResizeObserver } from '../libs/custom-hooks'
import { merge, isFunction, isNumber, isEqual } from 'lodash'
import { mergeReactProps } from '../libs/merge-react-props'
import { ContextEventType, useCanvasContext, useCanvasDispatch } from '../libs/context'



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
		const updateContext = useCanvasDispatch()
		const selfRef = React.useRef<HTMLElement>(null)
		const forkRef = useForkRef(selfRef, ref)
	
		if (!React.isValidElement(children)) {
			console.error(`Canvas.Container accepts single React node`)
			return null;
		}

		const updateSelfCoordinates = () => {
			console.log(`WTREF `, selfRef, forkRef, ref)
			if(!selfRef.current) {
				console.warn(`selfRef not defined, cannot update container coordinates ${canvasKey}`)
				return 
			}
			if(!globalContext || !globalContext.area || !globalContext.area.top || !globalContext.area.left) {
				console.log(`skipping update ${canvasKey}, area not initialized`)
				return 
			}
			const currentContext = globalContext.descriptors[canvasKey] || {}
			const rects = selfRef.current.getBoundingClientRect()
			const scaleModifier = 
				(isNumber(currentContext.atScale) && globalContext.area.scale != currentContext.atScale) ?
				currentContext.atScale : 1

			updateContext({
				type: ContextEventType.patch,
				key: canvasKey,
				value: {
					top: (rects.top - globalContext.area.top) / scaleModifier,
					left: (rects.left - globalContext.area.left) / scaleModifier,
					width: rects.width / scaleModifier,
					height: rects.height / scaleModifier,
					key: canvasKey,
					isAbsolute: isAbsolute || isExtra || currentContext.isAbsolute,
					canBeBound: !!canBound || currentContext?.canBeBound || undefined,
					atScale: globalContext.area.scale,
					relative: {
						top: currentContext?.relative?.top || 0,
						left: currentContext?.relative?.left || 0
					}
				}
			})
		}

		useResizeObserver(selfRef, () => {
			updateSelfCoordinates()
		})

		useCustomCompareEffect( () => {
			console.log('EFFECT Local context', globalContext.descriptors[canvasKey])
			updateSelfCoordinates()
		}, [globalContext.area, globalContext.descriptors[canvasKey]], isEqual)
		
		useDidMount( () => {
			console.log(`WTREF `, selfRef, forkRef, ref)
			console.log('Local context', globalContext.descriptors[canvasKey])
			if(containerProps.onMount && isFunction(containerProps.onMount)) 
				containerProps.onMount()
		})
	
		containerProps.className = `${containerProps.className || ''} inline-block ${isExtra ? 'absolute' : 'relative'} cursor-grab [&_*]:cursor-auto`
		const compositionProps = mergeReactProps(containerProps, children.props)
	
		const currentContext = globalContext.descriptors[props.canvasKey]
	
		const applyProps = {
			ref: forkRef,
			style: {
				top: currentContext?.relative?.top ? currentContext.relative.top+'px' : null,
				left: currentContext?.relative?.left ? currentContext.relative.left+'px' : null
			},
			key: canvasKey,
			['data-key']: canvasKey,
			['data-canvas-container']: true,
			['data-canvas-absolute']: isExtra || isAbsolute || currentContext?.isExtra,
			['data-canvas-bound']: currentContext?.boundToContainer || boundTo || undefined,
			['data-canvas-allow-bound']: !!canBound || currentContext?.canBeBound || undefined,
		}
	
		// return <div className={`${props.className || ''} border-2 border-transparent hover:border-blue-500 relative`} {...applyProps}>
		// 	{children}
		// </div>
		return React.cloneElement(children, { ...compositionProps, ...applyProps })
	} catch(err) {
		console.error(err)
	}
});

Container.displayName = 'Canvas.Container'

export type TCanvasContainerElement = typeof Container

export default Container;