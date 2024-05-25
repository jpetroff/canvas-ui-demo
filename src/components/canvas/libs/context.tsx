import { each, isArray, isObject, clone, extend, merge } from 'lodash'
import type { TAreaContext } from '../Area'
import * as React from 'react'

const CanvasContext = React.createContext<TCanvasContextState>(null)
const CanvasContextEvent = React.createContext<React.Dispatch<CanvasEvent>>(null)

export type TCanvasContextState = {
	descriptors: IContainerDescriptorCollection
	connectors: TConnectorPathList
	area: TAreaContext
}

interface ICanvasContextProviderProps {
	value: TCanvasContextState,
	children?: React.ReactNode | React.ReactNode[]
}

const CanvasContextProvider: React.FunctionComponent<ICanvasContextProviderProps> = (props) => {
	const [_globalState, updateState] = React.useReducer(updateGlobalState, props.value)

	const globalState = {
		area: _globalState.area,
		connectors: props.value.connectors,
		descriptors: props.value.descriptors
	}


	return (
		<CanvasContext.Provider value={globalState}>
			<CanvasContextEvent.Provider value={updateState}>
				{props.children}
			</CanvasContextEvent.Provider>
		</CanvasContext.Provider>
	)
}

export default CanvasContextProvider

export function useCanvasContext() : TCanvasContextState {
	return React.useContext(CanvasContext)
}

export function useCanvasDispatch() {
	return React.useContext(CanvasContextEvent)
}

function updateGlobalState(state: TCanvasContextState, event: CanvasEvent) : TCanvasContextState {
	switch (event.type) {
		case ContextEventType.replace : {
			return handleReplace(state, event.value)
		}
		case ContextEventType.patch : {
			return handlePatch(state, event.value)
		}
		case ContextEventType.delete : {
			return handleDelete(state, event.key)
		}
		case ContextEventType.resize : {
			return handleResize(state, event.value)
		}
	}
}

function handleReplace(
	state: TCanvasContextState, 
	values: TContainerMeasure[] | IContainerDescriptorCollection
) {
	try {
		if(!isArray(values) && isObject(values))
			return {
				descriptors: values,
				connectors: state.connectors,
				area: state.area
			}

		const newState = extend({}, state)
		
		each(values, (value) => {
			if(!value.key) {
				console.warn(`Replace chunk did not provide container key (skipping):`, value)
				return
			}
			newState.descriptors[value.key] = value
		})
		
		return newState
	} catch(err) {
		console.warn('Failed to execute state replace on', values)
		console.error(err)
	}
}

function handlePatch(
	state: TCanvasContextState, 
	_value: Partial<TContainerMeasure> | Partial<TContainerMeasure>[],
	key: string = null
) {
	try {
		const newState = extend({}, state)

		if(!isArray(_value) && key) {
			newState.descriptors[key] = extend({}, newState.descriptors[key], _value)
			return newState
		}

		if(isArray(_value)) {
			each(_value, (value) => {
				const key = value.key

				if(!key) { console.log(`Skipping value missing key:`, value); return }

				newState.descriptors[key] = extend({}, newState.descriptors[key], _value)
			})
			return newState
		}

		console.warn(`Invalid value provided for patch handler:`, _value)
	} catch(err) {
		console.warn('Failed to execute state patch on', _value)
		console.error(err)
	}
}

function handleDelete(
	state: TCanvasContextState, 
	key: string
) {
	try {
		const newState = extend({}, state)

		if(key && newState.descriptors[key]) {
			delete(newState.descriptors[key])
			return newState
		}

	} catch(err) {
		console.warn('Failed to execute state delete on', key)
		console.error(err)
	}
}

function handleResize(
	state: TCanvasContextState, 
	value: Partial<TAreaContext>
) {
	try {
		const newState = extend(
			{}, 
			state, 
			{
				area: extend({}, state.area, value)
			})

		return newState
	} catch(err) {
		console.warn('Failed to execute state resize on', value)
		console.error(err)
	}
}

export enum ContextEventType {
	replace = 'replace',
	patch = 'patch',
	delete = 'delete',
	resize = 'canvas.resize'
}

export type CanvasEvent = 
	{
		type: ContextEventType.replace
		value: TContainerMeasure[] | IContainerDescriptorCollection
	}
	|
	{
		type: ContextEventType.patch
		value: Partial<TContainerMeasure>[]
	}
	|
	{
		type: ContextEventType.patch
		key: string
		value: Partial<TContainerMeasure>
	}
	|
	{
		type: ContextEventType.delete
		key: string
	}
	|
	{
		type: ContextEventType.resize,
		value: Partial<TAreaContext>
	}