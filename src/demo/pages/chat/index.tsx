import useLocalStorage from '../../js/utils'
import * as React from 'react'
import Toolbar from '@apps/toolbar'
import Canvas from '@components/canvas'
import { formMappings } from './form-setup'
import { Dictionary, cloneDeep, each, extend, filter, find, findIndex, findLast, max } from 'lodash'
import './style.css' 
import { useDidMount } from '@components/canvas/libs/custom-hooks'
import { isAbsolute } from 'path'
import { ICanvasContainerProps } from '@components/canvas/Container'
import { Button } from '@radix-ui/themes'
import { PlusIcon } from '@radix-ui/react-icons'
import { ChatBlock } from './forms'
import CommentBubble from '@components/comment-bubble'
import Note from '@components/note'

const initValue = [
	formMappings['chat-flow-start'].props
]

const initConnectors = [

]

const gridCoords = {
	'chat-flow-start': { col: 1, row: 1,	colSpan: 1,	rowSpan: 1, absolute: false}
}

interface IChatPageProps { 

}

function createRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

interface IExtendedCoordinates extends TContainerDescriptor {
	col?: number, row?: number,	colSpan?: number,	rowSpan?: number
}

const PageChat: React.FunctionComponent<IChatPageProps> = (props) => {
	const [containerCoordinates, setContainerCoordinates, removeCoordinates] = useLocalStorage<Dictionary<IExtendedCoordinates>>('chat-page-coordinates',gridCoords)
	const [forms, setForms, removeForms] = useLocalStorage<any[]>('chat-page-content', initValue)
	const [extras, setExtras, removeExtras] = useLocalStorage('chat-page-extras', [])
	const [connectors, setConnectors, removeConnectors] = useLocalStorage('chat-page-connectors', initConnectors)
	const [scale, setScale] = React.useState(1)
	const [addMode, setAddMode] = React.useState(null)

	function conditionalChecks(currentForms: any[]) {

	}

	useDidMount( () => {
		let current = cloneDeep(forms)
		conditionalChecks(current)
		setForms(current)
	})

	function handleFormChange(key: string, form: any, flow?: {from: string, to?: string}) {
		let current = cloneDeep(forms)
		const index = findIndex(current, { canvasKey: key })

		if(index == -1) {
			console.warn(`Form with key '${key}' and index ${index} not found! Array`, current)
			return
		}

		current[index] = extend(current[index], form)
		console.log(`Form change`, key, form, current) 
 
		let newKey = null
		if(flow) {
			newKey = updateFlows(current, index, key, flow.from, flow.to)
		}

		if(newKey && find(current[index].content, {field: 'goto', value: '___new-flow'})) {
			find(current[index].content, {field: 'goto', value: '___new-flow'}).value = newKey
		} else if(newKey) {
			const _scripts = filter(current[index].content, {field: 'script'})
			each(_scripts, (scriptField) => {
				each(scriptField.choices, (choice) => {
					if(choice.dest == '___new-flow') choice.dest = newKey
				})
			} )
		}

		conditionalChecks(current)
		setForms(current)
	}

	function updateFlows(updatedForms: any, index: number, container: string, from: string, to?: string) {

		let updatedCoords = cloneDeep(containerCoordinates)
		let updatedConnectors = Array.from(connectors)

		let newFlowKey = null

		updatedConnectors = filter(connectors, (connector) => String(connector.from) != from)
		if(!to || to == '___new-flow') {
			const lastIndex = updatedForms.length
			updatedForms.push(
				formMappings['default'](updatedForms.length).props
			)
			const prevItem = updatedForms[lastIndex - 1]

			const newCol = (updatedCoords[container || prevItem.canvasKey].col || 0) + 1
			const _lastColItem = findLast(updatedCoords, {col: newCol}) || {row:0}
			const _currRow = updatedCoords[container].row
			const _checkSpaceNext = findLast(updatedCoords, {col: newCol, row: _currRow})

			updatedCoords[updatedForms[lastIndex].canvasKey] = {
				col: (updatedCoords[container || prevItem.canvasKey].col || 0) + 1,
				row: _checkSpaceNext ? _lastColItem.row + 1 : _currRow,
				colSpan: 1,
				rowSpan: 1
			}
			updatedConnectors.push({
				from,
				to: `${updatedForms[lastIndex].canvasKey}~top`
			})
			newFlowKey = updatedForms[lastIndex].canvasKey
		} else {
			updatedConnectors.push({
				from,
				to: `${to}~top`
			})
		}
		setContainerCoordinates(updatedCoords)
		setConnectors(updatedConnectors)

		return newFlowKey
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

	function handleFormRemove(index: number) {
		let updatedForms = Array.from(forms)
		const key = updatedForms[index].canvasKey
		let updatedConnectors = Array.from(connectors)
		updatedConnectors = filter(connectors, (connector) => String(connector.from).indexOf(key) == -1 && String(connector.to).indexOf(key) == -1)
		updatedForms.splice(index, 1)
		setForms(updatedForms)
		setConnectors(updatedConnectors)
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
			<Canvas.Layout className='grid grid-flow-cols auto-cols-[20rem] grid-flow-rows gap-16 p-16 items-start'>
				{forms.map( (_props, index) => {
					const props = cloneDeep(_props)
					const ContainerComponent = ChatBlock as any //formMappings[props.canvasKey].component
					props.className = `${props.className || ''} ${createGridClass(containerCoordinates[props.canvasKey])}`
					return (
						<Canvas.Container blockId={props.canvasKey} {...props}>
							<ContainerComponent 
								onFormChange={ (value, flow) => handleFormChange(props.canvasKey, value, flow) }
								onFlowRemove={ (value) => handleFormRemove(index) }
								existingFlows={ forms.map( (form) => { return {key: form.canvasKey, name: String(form.canvasKey).replace(/-/ig, ' ')} } )}
							/>
						</Canvas.Container>
					)
				})}
			</Canvas.Layout>
			<Canvas.Extras>
				{extras.map(
					(item, index) => {
						const content =	item.type == 'comment' ? <CommentBubble onChange={(value) => handleCommentChange(index, value)} /> :
														item.type == 'note' ? <Note message={item.message} onChange={(value) => handleNoteChange(index, value)} onRemove={() => handleNoteChange(index, '', true)} /> :
														null
						return <Canvas.Container {...item} absolute={true} extra={true} sticky={true}>
							{/* {item.type == 'comment' && <CommentBubble onChange={(value) => handleCommentChange(index, value)} />} */}
							{/* {item.type == 'note' && <Note message={item.message} onChange={(value) => handleNoteChange(index, value)} onRemove={() => handleNoteChange(index, '', true)} />} */}
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

export default PageChat 

function createGridClass( {col, row, colSpan, rowSpan}: {col?:number, row?: number, colSpan?:number, rowSpan?: number} ) : string {
	return [
		`col-start-${col || 1}`,
		`row-start-${row || 1}`,
		`col-span-${colSpan || 1}`,
		`row-span-${rowSpan || 1}`,
	].join(' ')
}