import useLocalStorage from '../../js/utils'
import * as React from 'react'
import Toolbar from '@apps/toolbar'
import Canvas from '@components/canvas'
import { formMappings } from './form-setup'
import { Dictionary, assign, cloneDeep, each, extend, filter, find, findIndex, findLast, groupBy, map, max, merge, sortBy, transform } from 'lodash'
// import './style.css' 
import { useDidMount } from '@components/canvas/libs/custom-hooks'
import { isAbsolute } from 'path'
import { ICanvasContainerProps } from '@components/canvas/Container'
import { Button, Flex } from '@radix-ui/themes'
import { PlusIcon } from '@radix-ui/react-icons'
import { IChangeEvent, StartBlock, StepBlock, generateBlockname } from './forms'
import { ChildConnectorOrientation } from '@components/canvas/Area/connectors'
import CommentBubble from '@components/comment-bubble'
import Note from '@components/note'

const initValue = [
	formMappings['start-block'].props
]

const initConnectors = [

]

const gridCoords = {
	'start-block': {row: 1,	index: 0, absolute: false}
}

function createRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

interface IAutoPageProps { 

}

interface IExtendedCoordinates extends TContainerDescriptor {
	row?: number,	index?: number
}

const PageAuto: React.FunctionComponent<IAutoPageProps> = (props) => {
	const [containerCoordinates, setContainerCoordinates, removeCoordinates] = useLocalStorage<Dictionary<IExtendedCoordinates>>('auto-page-coordinates',gridCoords)
	const [forms, setForms, removeForms] = useLocalStorage<any[]>('auto-page-content', initValue)
	const [extras, setExtras, removeExtras] = useLocalStorage('auto-page-extras', [])
	const [connectors, setConnectors, removeConnectors] = useLocalStorage('auto-page-connectors', initConnectors)
	const [scale, setScale] = React.useState(1)
	const [addMode, setAddMode] = React.useState(null)

	function conditionalChecks(currentForms: any[]) {

	}

	useDidMount( () => {
		let current = cloneDeep(forms)
		conditionalChecks(current)
		setForms(current)
	})

	function handleFormChange(key: string, event: IChangeEvent) {
		let current = cloneDeep(forms)
		const index = findIndex(current, { canvasKey: key })

		if(index == -1) {
			console.warn(`Form with key '${key}' and index ${index} not found! Array`, current)
			return
		}

		if(event.type == 'change') {
			current[index] = assign(current[index], event.value)
		} else if (event.type == 'add-step') {
			current.push( formMappings['default']().props )
			const toKey = current[current.length - 1].canvasKey
			updateFlows(current, current.length - 1, index, event.value.from || key, toKey)
			current[index].connections.push(toKey)
		} else if(event.type == 'delete') {
			current = handleFormRemove(index, current)
		} else if (event.type == 'connect' && event.value.to) {
			const indexTo = findIndex(current, {canvasKey: event.value.to})
			if(indexTo != -1) {
				updateFlows(current, indexTo, index, event.value.from || key, event.value.to)
				current[index].connections.push(event.value.to)
			}
		}

		conditionalChecks(current)
		setForms(current)
	}

	function updateFlows(updatedForms: any, indexTo: number, indexFrom: number, from: string, to: string) {

		let updatedCoords = cloneDeep(containerCoordinates)
		let updatedConnectors = Array.from(connectors)

		// updatedConnectors = filter(connectors, (connector) => String(connector.from) != from)

		if(indexTo != -1) {
			const key = updatedForms[indexTo].canvasKey

			if(!updatedCoords[key]) 
				updatedCoords[key] = {
					row: updatedCoords[updatedForms[indexFrom].canvasKey].row + 1,
					index: 0
				}
		}

		if(from && to) {
			const sameRow = updatedCoords[updatedForms[indexFrom].canvasKey].row == updatedCoords[updatedForms[indexTo].canvasKey].row
			updatedConnectors.push({
				from: from,
				to: to,
				startOrientation: updatedForms[indexFrom].canvasKey == from && !sameRow ? ChildConnectorOrientation.vertical : void 0,
				endOrientation: updatedForms[indexTo].canvasKey == to && !sameRow ? ChildConnectorOrientation.vertical : void 0
			})
		}

		setContainerCoordinates(updatedCoords)
		setConnectors(updatedConnectors)
	}

	function handleContainerAdd(type: string, coords?: TContainerDescriptor) {
		if(type == 'comment') {
			const newKey = `comment-${createRandomString(10)}`
			let newExtras = Array.from(extras)
			newExtras.push({
				canvasKey: `${newKey}`,
				type: 'comment',
				message: '',
				initials: 'JS',
				name: 'Jon Snow'
			})
			let newCoordinates = cloneDeep(containerCoordinates)
			coords.relative.top -= 40
			newCoordinates[newKey] = { ...coords, absolute: true }
			setExtras(newExtras)
			setContainerCoordinates(newCoordinates)
		} else if (type == 'note') {
			const newKey = `note-${createRandomString(10)}`
			let newExtras = Array.from(extras)
			newExtras.push({
				canvasKey: `${newKey}`,
				type: 'note',
				message: ''
			})
			let newCoordinates = cloneDeep(containerCoordinates)
			newCoordinates[newKey] = { ...coords, absolute: true, extra:true }
			setExtras(newExtras)
			setContainerCoordinates(newCoordinates)
		}
		setAddMode(null)
	}

	function handleCommentChange(index: number, value: string) {
		let newExtras = Array.from(extras)
		const key = extras[index]?.canvasKey
		let newCoords = cloneDeep(containerCoordinates)
		if(value == '') {
			newExtras.splice(index, 1)
			delete(containerCoordinates[key])
		} else {
			newExtras[index].message = value
		}
		setContainerCoordinates(newCoords)
		setExtras(newExtras)
	}

	function handleNoteChange(index: number, value: string, remove: boolean = false) {
		let newExtras = Array.from(extras)
		const key = extras[index]?.canvasKey
		let newCoords = cloneDeep(containerCoordinates)
		if(remove) {
			newExtras.splice(index, 1)
			delete(containerCoordinates[key])
		} else {
			newExtras[index].message = value
		}
		setContainerCoordinates(newCoords)
		setExtras(newExtras)
	}

	function handleFormRemove(index: number, current: any) {
		let updatedForms = current
		const key = updatedForms[index].canvasKey
		let updatedConnectors = cloneDeep(connectors)
		updatedConnectors = filter(connectors, (connector) => String(connector.from).indexOf(key) == -1 && String(connector.to).indexOf(key) == -1)
		updatedForms.splice(index, 1)
		setConnectors(updatedConnectors)
		return current
	}


	return (<>
	<div className="p-2 w-full h-full overflow-hidden">
		<Canvas
			scale={scale}
			containerCoordinates={containerCoordinates}
			connectors={connectors}
			onLayoutChange={(newLayout) => { console.log(`New layout:`, newLayout); setContainerCoordinates(newLayout as Dictionary<IExtendedCoordinates>) } }
			// onOrderChange={(event) => { handleContainerSwap(event) } }
			className="bg-transparent rounded-lg border border-slatedark-6"
			addMode={!!addMode} 
			onPlaceAdd={(coords) => handleContainerAdd(addMode, coords)}
			scroll={<Canvas.Scroller />}
		>
			<Canvas.Layout className='flex flex-col gap-16 p-16 justify-start'>
				{mapRow<any>(forms, containerCoordinates, (rowItems, rowKey) => {
					return (
						<Flex direction="row" justify="start" align="start" className="gap-16 flex-grow-1">
						{
							rowItems.map( 
								(props) => {
									const ContainerComponent = (props.canvasKey == 'start-block' ? StartBlock : StepBlock) as any
									return (
										<Canvas.Container {...props}>
											<ContainerComponent 
												onFormChange={ (value) => handleFormChange(props.canvasKey, value) }
												connections={ [] }
												availableConnections={ forms.map( (form) => { return {key: form.canvasKey, name: generateBlockname(form)} } )}
											/>
										</Canvas.Container>
									)
								}
							)
						}
						</Flex>
					)
				})
				}
			</Canvas.Layout>
			<Canvas.Extras>
				{extras.map(
					(item, index) => {
						const content =	item.type == 'comment' ? <CommentBubble onChange={(value) => handleCommentChange(index, value)} /> :
														item.type == 'note' ? <Note message={item.message} onChange={(value) => handleNoteChange(index, value)} onRemove={() => handleNoteChange(index, '', true)} /> :
														null
						return <Canvas.Container {...item} absolute={true} extra={true} sticky={true}>
							{content}
						</Canvas.Container>
					}
				)}
			</Canvas.Extras>
		</Canvas>
	</div>
	<Toolbar 
			scale={scale} addMode={addMode} 
			onScaleChange={(scale) => setScale(scale)} 
			onAddMode={(type) => setAddMode(type)}
			onReset={() => {setContainerCoordinates(gridCoords); setExtras([]); setForms(initValue); setConnectors([])} }
		/>
	</>)
}

export default PageAuto

function mapRow<T>(allForms: any[], _coords: Dictionary<IExtendedCoordinates>,  fn: (rowItems: T[], rowIndex: number) => React.ReactNode) : React.ReactNode[] {
	const coords = map(
		_coords, 
		(item, key) => { return {key, ...item} }
	)
	const rowed = sortBy(
		groupBy(
			coords
		, 'row')
	, (_, key) => { return key })
	const result = map(rowed,
		(items, rowKey) => {
			const matchedItemKeys = items.map( (item) => item.key )
			const forms = filter(allForms, (form) => matchedItemKeys.indexOf(form.canvasKey) != -1)
			return fn(forms, rowKey)
		}
	)

	return result
}