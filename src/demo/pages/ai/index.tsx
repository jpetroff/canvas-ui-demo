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
import CommentBubble from '@components/comment-bubble'
import Note from '@components/note'

function createRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


const initValue = [
	formMappings['ai-intent-form'].props,
	formMappings['ai-choose-model'].props,
	formMappings['ai-system-prompt-placeholder'].props,
	formMappings['ai-prompt-template'].props,
	formMappings['ai-add-context-placeholder'].props,
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
	'ai-intent-form': { col: 1, row: 2,	colSpan: 4,	rowSpan: 1, absolute: false},
	'ai-user-prompt': { col: 1, row: 3,	colSpan: 4,	rowSpan: 2, absolute: false},
	'ai-add-context': { col: 1, row: 5,	colSpan: 4,	rowSpan: 1, absolute: false},
	'ai-system-prompt': { col: 1, row: 6,	colSpan: 4,	rowSpan: 1, absolute: false},

	'ai-choose-model': { col: 6, row: 2,	colSpan: 4,	rowSpan: 2, absolute: false},
	'ai-prompt-template': { col: 6, row: 4,	colSpan: 4,	rowSpan: 3, absolute: false},

	'ai-add-context-placeholder': { col: 1, row: 5,	colSpan: 4,	rowSpan: 1, absolute: false},
	'ai-system-prompt-placeholder': { col: 1, row: 6,	colSpan: 4,	rowSpan: 1, absolute: false},
}

interface IAIPageProps { 

}

interface IExtendedCoordinates extends TContainerDescriptor {
	col?: number, row?: number,	colSpan?: number,	rowSpan?: number
}

const PageAi: React.FunctionComponent<IAIPageProps> = (props) => {
	const [containerCoordinates, setContainerCoordinates, removeCoordinates] = useLocalStorage<Dictionary<IExtendedCoordinates>>('ai-page-coordinates',gridCoords)
	const [forms, setForms, removeForms] = useLocalStorage<any[]>('ai-page-content', initValue)
	const [extras, setExtras, removeExtras] = useLocalStorage('ai-page-extras', [])
	const [connectors, setConnectors, removeConnectors] = useLocalStorage('ai-page-connectors', initConnectors)
	const [scale, setScale] = React.useState(1)
	const [addMode, setAddMode] = React.useState(null)

	function conditionalChecks(current: any[]) {
		const templateIndex = findIndex(current, {canvasKey: 'ai-prompt-template'})
		const contextIndex = findIndex(current, {canvasKey: 'ai-add-context'})
		const systemPropmptIndex = findIndex(current, {canvasKey: 'ai-system-prompt'})
		console.log(`context check`, templateIndex, contextIndex)
		if( templateIndex != -1 ) {
			current[templateIndex].hasContext = contextIndex != -1 ? true : false
			current[templateIndex].hasSystem = systemPropmptIndex != -1 ? true : false

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


	function onAddCard(value: string, replace: string) {
		console.log(`add`, value, `replace`, replace)
		let updatedForms = Array.from(forms)

		updatedForms.splice(
			findIndex(updatedForms, {canvasKey: replace}),
			1,
			formMappings[value].props
		)

		conditionalChecks(updatedForms)

		console.log(updatedForms)
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
			onPlaceAdd={(coords) => handleContainerAdd(addMode, coords)}
			scroll={<Canvas.Scroller />}
		>
			<Canvas.Layout className='grid grid-flow-cols auto-cols-[6rem] grid-flow-rows gap-y-8 gap-x-0 p-16 items-start'>
				{forms.map( (_props) => {
					const props = cloneDeep(_props)
					const ContainerComponent = formMappings[props.canvasKey].component
					if(ContainerComponent.displayName == 'PlaceholderCard') {
						// props.onAddCard = (value) => onAddCard(value, props.canvasKey)
						props.className = `${props.className || ''} ${createGridClass(containerCoordinates[props.canvasKey])}`
						return (
							<Canvas.Container {...props}>
								<ContainerComponent>
									<Button onClick={() => onAddCard(props.value, props.canvasKey)} size="3" variant="outline" className="w-full cursor-pointer">
										{props.text}
									</Button>
								</ContainerComponent>
							</Canvas.Container>
						)
					} else {
						props.onFormChange = (value) => onFormChange(props.canvasKey, value)
						props.className = `${props.className || ''} ${createGridClass(containerCoordinates[props.canvasKey])}`
	
						return (
							<Canvas.Container {...props}>
								<ContainerComponent />
							</Canvas.Container>
						)
					}
				})}
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
			onReset={() => {setContainerCoordinates(gridCoords); setExtras([]); setForms(initValue)} }
		/>
	</>)
}

export default PageAi

function createGridClass( {col, row, colSpan, rowSpan}: {col?:number, row?: number, colSpan?:number, rowSpan?: number} ) : string {
	return [
		`col-start-${col || 1}`,
		`row-start-${row || 1}`,
		`col-span-${colSpan || 1}`,
		`row-span-${rowSpan || 1}`,
	].join(' ')
}