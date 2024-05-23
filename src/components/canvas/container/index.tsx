/* 
	Renders as child — see https://medium.com/@bryanmylee/aschild-in-react-svelte-vue-and-solid-for-render-delegation-645c73650ced
 */

import * as React from 'react'
import useCustomCompareEffect, { useDidMount, useForkRef, useResizeObserver } from '../libs/custom-hooks'
import { merge, isFunction, isNumber, isEqual, isObject } from 'lodash'
import { mergeReactProps } from '../libs/merge-react-props'
import { ContextEventType, useCanvasContext, useCanvasDispatch } from '../libs/context'
import { _r } from '../libs/utils'



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

		const currentContext = globalContext.descriptors[props.canvasKey] || {}

		let updateDeps = [globalContext.area, currentContext]
		if(currentContext.sticky && currentContext.boundToContainer) {
			updateDeps.push(globalContext.descriptors[currentContext.boundToContainer])
		} else { updateDeps.push(null) } 

		const updateSelfCoordinates = () => {
			if(!globalContext || !globalContext.area || !globalContext.area.top || !globalContext.area.left) {
				console.log(`skipping update ${canvasKey}, area not initialized`)
				return 
			}
			if(!selfRef.current) {
				console.warn(`selfRef not defined, cannot update container coordinates ${canvasKey}`)
				return 
			}

			const rects = selfRef.current.getBoundingClientRect()
			const scaleModifier = 
				(isNumber(currentContext.atScale) && globalContext.area.scale != currentContext.atScale) ?
				currentContext.atScale : 1

			let top = (rects.top - globalContext.area.top) / scaleModifier
			let left = (rects.left - globalContext.area.left) / scaleModifier

			let relativeTop =  currentContext.relative?.top || 0
			let relativeLeft =  currentContext.relative?.left || 0

			let parentTop = currentContext.parent?.top || 0
			let parentLeft = currentContext.parent?.top || 0

			const bindingContainer = globalContext.descriptors[currentContext.boundToContainer]
			const hasValidBindingContainer = currentContext.sticky && currentContext.boundToContainer && isObject(bindingContainer)

			if(
				hasValidBindingContainer &&
				currentContext.parent?.top != bindingContainer.top && 
				currentContext.parent?.top != bindingContainer.left
			) {
				parentTop = bindingContainer.top + bindingContainer.relative.top
				parentLeft = bindingContainer.left + bindingContainer.relative.left
				top = parentTop + relativeTop
				left = parentLeft + relativeLeft
			} else if (currentContext.sticky && !currentContext.boundToContainer) {
				parentTop = 0
				parentLeft = 0
				relativeTop = top
				relativeLeft = left
			}

			// console.log(!currentContext.boundToContainer, currentContext.parent, ` == `, [bindingContainer.top, bindingContainer.left])

			const newDescriptor =  {
				// props depend on possible parent or sticky container
				top: _r(top),
				left: _r(left),
				relative: {
					top: _r(relativeTop),
					left: _r(relativeLeft)
				},
				parent: {
					top: _r(parentTop),
					left: _r(parentLeft)
				},

				// independent objective props
				width: rects.width / scaleModifier,
				height: rects.height / scaleModifier,
				key: canvasKey,
				isAbsolute: isAbsolute || isExtra || currentContext.isAbsolute,
				sticky: !!canBound || currentContext.sticky || undefined,
				atScale: globalContext.area.scale
			}

			if(isEqual(newDescriptor, currentContext)) return

			updateContext({
				type: ContextEventType.patch,
				key: canvasKey,
				value: newDescriptor
			})
		}

		useResizeObserver(selfRef, () => {
			updateSelfCoordinates()
		})

		useCustomCompareEffect( () => {
			console.log('EFFECT Local context', canvasKey, globalContext.descriptors[canvasKey])
			updateSelfCoordinates()
		}, updateDeps, isEqual)
		
		useDidMount( () => {
			if(containerProps.onMount && isFunction(containerProps.onMount)) 
				containerProps.onMount()
		})
	
		containerProps.className = `${containerProps.className || ''} inline-block ${isExtra ? 'absolute' : 'relative'} cursor-grab [&_*]:cursor-auto`
		const compositionProps = mergeReactProps(containerProps, children.props)
		
		// console.log(currentContext, currentContext?.relative?.top, isNumber(currentContext?.relative?.top + currentContext?.parent?.top),currentContext?.relative?.top + currentContext?.parent?.top )

	
		const applyProps = {
			ref: forkRef,
			style: {
				top: 	currentContext?.relative && currentContext?.parent
							? (currentContext.parent.top + currentContext.relative.top)+'px' 
							: 0,
				left:	currentContext?.relative && currentContext?.parent
							? (currentContext.parent.left + currentContext.relative.left)+'px' 
							: 0
			},
			key: canvasKey,
			['data-key']: canvasKey,
			['data-canvas-container']: true,
			['data-canvas-absolute']: isExtra || isAbsolute || currentContext?.isExtra,
			['data-canvas-bound']: currentContext?.boundToContainer || boundTo || undefined,
			['data-canvas-allow-bound']: !!canBound || currentContext?.sticky || undefined,
		}

	
		return React.cloneElement(children, { ...compositionProps, ...applyProps })
	} catch(err) {
		console.error(err)
	}
});

Container.displayName = 'Canvas.Container'

export type TCanvasContainerElement = typeof Container

export default Container;