import useLocalStorage from '../../js/utils'
import * as React from 'react'
import Toolbar from '@apps/toolbar'
import Canvas from '@components/canvas'
import { formMappings } from './form-setup'
import { cloneDeep, extend, findIndex } from 'lodash'
import './style.css' 

const initValue = [
	formMappings['ai-intent-form'].props,
	formMappings['ai-choose-model'].props,
	formMappings['ai-system-prompt'].props,
	formMappings['ai-prompt-template'].props,
	formMappings['ai-add-context'].props,
	formMappings['ai-user-prompt'].props
]

interface IAIPageProps { 

}

const PageAi: React.FunctionComponent<IAIPageProps> = (props) => {
	const [containerCoordinates, setContainerCoordinates] = useLocalStorage('ai-page-coordinates',{})
	const [forms, setForms] = useLocalStorage<any[]>('ai-page-content', initValue)
	const [extras, setExtras] = useLocalStorage('ai-page-extras', [])
	const [connectors, setConnectors] = useLocalStorage('ai-page-content',[])
	const [scale, setScale] = React.useState(1)
	const [addMode, setAddMode] = React.useState(null)

	function onFormChange(key: string, form: any) {
		let current = cloneDeep(forms)
		const index = findIndex(current, { canvasKey: key })
		if(index == -1) {
			console.warn(`Form with key '${key}' and index ${index} not found! Array`, current)
			return
		}

		current[index] = extend(current[index], form)
		console.log(`Form change`, key, form, current) 
		setForms(current)
	}

	return (<>
	<div className="p-2 w-full h-full overflow-hidden">
		<Canvas
			scale={scale}
			containerCoordinates={containerCoordinates}
			connectors={connectors}
			onLayoutChange={(newLayout) => { setContainerCoordinates(newLayout) } }
			// onOrderChange={(event) => { handleContainerSwap(event) } }
			className="bg-transparent rounded-lg border border-slatedark-6"
			addMode={!!addMode} 
			// onPlaceAdd={(coords) => handleContainerAdd(addMode, coords)}
			scroll={<Canvas.Scroller />}
		>
			<Canvas.Layout className='grid grid-cols-[20rem] grid-flow-rows gap-16 p-4 m-16 items-center'>
				{forms.map( (props) => {
					const ContainerComponent = formMappings[props.canvasKey].component
					props.onFormChange = (value) => onFormChange(props.canvasKey, value)

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