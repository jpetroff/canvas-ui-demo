/* 
	Renders as child — see https://medium.com/@bryanmylee/aschild-in-react-svelte-vue-and-solid-for-render-delegation-645c73650ced
 */

import * as React from 'react'
import useCustomCompareEffect, { useDidMount, useForkRef, useResizeObserver } from '../libs/custom-hooks'
import { merge, isFunction, isNumber, isEqual, isObject } from 'lodash'
import { mergeReactProps } from '../libs/merge-react-props'
import { ContextEventType, useCanvasContext, useCanvasDispatch } from '../libs/context'
import { _r } from '../libs/utils'
import LayoutEngine from '../libs/layout-engine'



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
		const LE = new LayoutEngine({})
	
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
			const scaleModifier = globalContext.area.scale

			const [top, left, relative, parent] = LE.prepareContainerCoordinates(
				selfRef.current,
				canvasKey,
				currentContext,
				globalContext.area,
				currentContext.boundToContainer ? globalContext.descriptors[currentContext.boundToContainer] : null
			)
	
			console.log('Effect coords for ', canvasKey, [top, left, relative.top, relative.left, parent.top, parent.left ])			

			const newDescriptor =  {
				// props depend on possible parent or sticky container
				top: _r(top / scaleModifier),
				left: _r(left / scaleModifier),
				relative: {
					top: _r(relative.top / scaleModifier),
					left: _r(relative.left / scaleModifier)
				},
				parent: {
					top: _r(parent.top / scaleModifier),
					left: _r(parent.left / scaleModifier)
				},

				// independent objective props
				width: _r(rects.width / scaleModifier),
				height: _r(rects.height / scaleModifier),
				key: canvasKey,
				isAbsolute: isAbsolute || isExtra || currentContext.isAbsolute,
				sticky: !!canBound || currentContext.sticky || undefined,
				atScale: globalContext.area.scale
			}

			console.log(`Compare descriptors `, canvasKey, newDescriptor, currentContext, isEqual(newDescriptor, currentContext))

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

		React.useEffect( () => {
			console.log('EFFECT Local context', canvasKey, globalContext.descriptors[canvasKey])
			
		}, updateDeps)
		
		useDidMount( () => {
			updateSelfCoordinates()
			if(containerProps.onMount && isFunction(containerProps.onMount)) 
				containerProps.onMount()
		})
	
		containerProps.className = `${containerProps.className || ''} inline-block ${isExtra ? 'absolute' : 'relative'} cursor-grab [&_*]:cursor-auto`
		const compositionProps = mergeReactProps(containerProps, children.props)
		
		const [_top, _left, _relative, _parent] = LE.prepareContainerCoordinates(
			selfRef.current || null,
			canvasKey,
			currentContext,
			globalContext.area,
			currentContext.boundToContainer ? globalContext.descriptors[currentContext.boundToContainer] : null
		)

		console.log('Prepared coords for ', canvasKey, [_top, _left, _relative.top, _relative.left, _parent.top, _parent.left ])

	
		const applyProps = {
			ref: forkRef,
			style: {
				top: 	_parent.top + _relative.top,
				left:	_parent.left + _relative.left
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