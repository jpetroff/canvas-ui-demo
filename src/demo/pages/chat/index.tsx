import useLocalStorage from '../../js/utils'
import * as React from 'react'
import Toolbar from '@apps/toolbar'
import Canvas from '@components/canvas'
import { formMappings } from './form-setup'
import { Dictionary, cloneDeep, extend, findIndex } from 'lodash'
import './style.css' 
import { useDidMount } from '@components/canvas/libs/custom-hooks'
import { isAbsolute } from 'path'
import { ICanvasContainerProps } from '@components/canvas/Container'
import { Button } from '@radix-ui/themes'
import { PlusIcon } from '@radix-ui/react-icons'
import { ChatBlock } from './forms'

const initValue = [
	formMappings['chat-form-start'].props
]

const initConnectors = [

]

const gridCoords = {
	'chat-form-start': { col: 1, row: 1,	colSpan: 1,	rowSpan: 1, absolute: false}
}

interface IChatPageProps { 

}

interface IExtendedCoordinates extends TContainerDescriptor {
	col: number, row: number,	colSpan: number,	rowSpan: number
}

const PageChat: React.FunctionComponent<IChatPageProps> = (props) => {
	const [containerCoordinates, setContainerCoordinates, removeCoordinates] = useLocalStorage<Dictionary<IExtendedCoordinates>>('chat-page-coordinates',gridCoords)
	const [forms, setForms, removeForms] = useLocalStorage<any[]>('chat-page-content', initValue)
	const [extras, setExtras, removeExtras] = useLocalStorage('chat-page-extras', [])
	const [connectors, setConnectors, removeConnectors] = useLocalStorage('chat-page-connectors', initConnectors)
	const [scale, setScale] = React.useState(1)
	const [addMode, setAddMode] = React.useState(null)

	function conditionalChecks(current: any[]) {

	}

	useDidMount( () => {
		let current = cloneDeep(forms)
		conditionalChecks(current)
		setForms(current)
	})

	function handleFormChange(key: string, form: any) {
		let current = cloneDeep(forms)
		const index = findIndex(current, { canvasKey: key })
		if(index == -1) {
			console.warn(`Form with key '${key}' and index ${index} not found! Array`, current)
			return
		}

		current[index] = extend(current[index], form)
		console.log(`Form change`, key, form, current) 

		conditionalChecks(current)
		setForms(current)
	}

	function handleAddFlow(from: string, container: string) {
		let updatedForms = Array.from(forms)
		const index = updatedForms.length
		const lastItem = updatedForms[index - 1]

		updatedForms.push(
			formMappings['default'](updatedForms.length).props
		)

		let updatedCoords = cloneDeep(containerCoordinates)
		updatedCoords[updatedForms[index].canvasKey] = {
			col: (updatedCoords[container || lastItem.canvasKey].col || 0) + 1,
			row: 1,
			colSpan: 1,
			rowSpan: 1
		}

		let updatedConnectors = Array.from(connectors)
		if(from) {
			updatedConnectors.push({
				from,
				to: updatedForms[index].canvasKey
			})
		}

		conditionalChecks(updatedForms)

		console.log(updatedForms)
		setContainerCoordinates(updatedCoords)
		setConnectors(updatedConnectors)
		setForms(updatedForms)
	}

	function handleFormRemove(index: number) {
		let updatedForms = Array.from(forms)
		updatedForms.splice(index, 1)
		setForms(updatedForms)
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
			// onPlaceAdd={(coords) => handleContainerAdd(addMode, coords)}
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
								onFlowAdd={(from) => handleAddFlow(from, props.canvasKey)} 
								onFormChange={ (value) => handleFormChange(props.canvasKey, value) }
								onFlowRemove={ (value) => handleFormRemove(index) }
							/>
						</Canvas.Container>
					)
				})}
			</Canvas.Layout>
			<Canvas.Extras>
				
			</Canvas.Extras>
		</Canvas>
	</div>
	<Toolbar 
			scale={scale} addMode={addMode} 
			onScaleChange={(scale) => setScale(scale)} 
			onAddMode={(type) => setAddMode(type)}
			onReset={() => {setContainerCoordinates(gridCoords); removeExtras(); setForms(initValue)} }
		/>
	</>)
}

export default PageChat

function createGridClass( {col, row, colSpan, rowSpan}: {col:number, row: number, colSpan:number, rowSpan: number} ) : string {
	return [
		`col-start-${col || 1}`,
		`row-start-${row || 1}`,
		`col-span-${colSpan || 1}`,
		`row-span-${rowSpan || 1}`,
	].join(' ')
}