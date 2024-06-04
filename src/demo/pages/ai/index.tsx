import useLocalStorage from '../../js/utils'
import * as React from 'react'
import Toolbar from '@apps/toolbar'
import Canvas from '@components/canvas'
import { formMappings } from './form-setup'
import { Dictionary, cloneDeep, extend, findIndex, isEmpty } from 'lodash'
import './style.css' 
import { useDidMount } from '@components/canvas/libs/custom-hooks'
import { isAbsolute } from 'path'
import { ICanvasContainerProps } from '@components/canvas/Container'

const initValue = [
	formMappings['ai-intent-form'].props,
	formMappings['ai-choose-model'].props,
	formMappings['ai-system-prompt'].props,
	formMappings['ai-prompt-template'].props,
	formMappings['ai-add-context'].props,
	formMappings['ai-user-prompt'].props
]

const initConnectors = [
	{from: 'ai-system-prompt', to: 'var-system-prompt'},
	{from: 'ai-user-prompt', to: 'ai-add-context'},
	{from: 'ai-user-prompt', to: 'var-user-prompt'},
	{from: 'ai-add-context', to: 'var-context-prompt'},
	{from: 'ai-prompt-template', to: 'ai-choose-model'},
]

const gridCoords = {
	'ai-intent-form': { col: 1, row: 2,	colSpan: 2,	rowSpan: 1, absolute: false},
	'ai-user-prompt': { col: 1, row: 3,	colSpan: 2,	rowSpan: 1, absolute: false},
	'ai-system-prompt': { col: 1, row: 4,	colSpan: 2,	rowSpan: 1, absolute: false},
	'ai-add-context': { col: 1, row: 5,	colSpan: 2,	rowSpan: 1, absolute: false},

	'ai-choose-model': { col: 4, row: 2,	colSpan: 2,	rowSpan: 2, absolute: false},
	'ai-prompt-template': { col: 4, row: 3,	colSpan: 2,	rowSpan: 3, absolute: false},
}

interface IAIPageProps { 

}

interface IExtendedCoordinates extends TContainerDescriptor {
	col: number, row: number,	colSpan: number,	rowSpan: number
}

const PageAi: React.FunctionComponent<IAIPageProps> = (props) => {
	const [containerCoordinates, setContainerCoordinates] = useLocalStorage<Dictionary<IExtendedCoordinates>>('ai-page-coordinates',gridCoords)
	const [forms, setForms] = useLocalStorage<any[]>('ai-page-content', initValue)
	const [extras, setExtras] = useLocalStorage('ai-page-extras', [])
	const [connectors, setConnectors] = useLocalStorage('ai-page-connectors', initConnectors)
	const [scale, setScale] = React.useState(1)
	const [addMode, setAddMode] = React.useState(null)

	function conditionalChecks(current: any[]) {
		const templateIndex = findIndex(current, {canvasKey: 'ai-prompt-template'})
		const contextIndex = findIndex(current, {canvasKey: 'ai-add-context'})
		console.log(`context check`, templateIndex, contextIndex)
		if(
			contextIndex != -1 && templateIndex != -1
		) {
			current[templateIndex].hasContext = true
		} else if(templateIndex != -1) {
			current[templateIndex].hasContext = false
		}
	}

	useDidMount( () => {
		let current = cloneDeep(forms)
		conditionalChecks(current)
		setForms(current)
	})

	function onFormChange(key: string, form: any) {
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
			<Canvas.Layout className='grid grid-flow-cols auto-cols-[10rem] grid-flow-rows gap-16 p-16 items-start'>
				{forms.map( (_props) => {
					const props = cloneDeep(_props)
					const ContainerComponent = formMappings[props.canvasKey].component
					props.onFormChange = (value) => onFormChange(props.canvasKey, value)
					props.className = `${props.className || ''} ${createGridClass(containerCoordinates[props.canvasKey])}`

					return (
						<Canvas.Container {...props}>
							<ContainerComponent />
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
		/>
	</>)
}

export default PageAi

function createGridClass( {col, row, colSpan, rowSpan}: {col:number, row: number, colSpan:number, rowSpan: number} ) : string {
	return [
		`col-start-${col || 1}`,
		`row-start-${row || 1}`,
		`col-span-${colSpan || 1}`,
		`row-span-${rowSpan || 1}`,
	].join(' ')
}