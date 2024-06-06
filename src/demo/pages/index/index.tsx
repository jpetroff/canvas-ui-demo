import * as React from 'react'
import { RouteObject } from 'react-router-dom'
import { useLocation, useNavigate, useParams } from 'react-router'

import Canvas, { swapContainerCoordinates} from '@components/canvas'
import TestForm from '@apps/test-form'

import { Card, Box } from '@radix-ui/themes'
import CommentBubble from '@components/comment-bubble'
import { extend, filter, findIndex, map } from 'lodash'

import useLocalStorage from '../../js/utils'
import Toolbar from '@apps/toolbar'

interface IAppProps {
	router?: RouteObject
}

const PIndex: React.FunctionComponent<IAppProps> = (props) => {
	const navigate = useNavigate()
	const location = useLocation()

	const [storedDescriptors, storeDescriptors, removeDescriptors] = useLocalStorage<IContainerDescriptorCollection>('test-app-storage-descriptors')
	const [storedConnectors, storeConnectors, removeConnectors] = useLocalStorage<TConnectorPathList>('test-app-storage-connectors')

	const containersInitvalue = [
		<Canvas.Container swappable={true} canvasKey='entry-form'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container swappable={true} canvasKey='second-form'>
			<Card className='p-4'>
				<p>Test new</p>
				<p className='dsada'>Second child 1</p>
				<p>Second child 2</p>
				<Canvas.Section canvasKey='second-form#option1'>
					<p>Named section 3</p>
				</Canvas.Section>
			</Card>
		</Canvas.Container>,
		<Canvas.Container swappable={true} canvasKey='entry-form-2'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container swappable={true} canvasKey='entry-form-3'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container swappable={true} canvasKey='entry-form-4'>
			<TestForm className='p-4' />
		</Canvas.Container>
	]


	const [containers, setContainers] = React.useState(containersInitvalue)

	const [containerCoordinates, setContainerCoordinates] = React.useState<IContainerDescriptorCollection>(storedDescriptors || {})
	const [connectors, setConnectors] = React.useState<TConnectorPathList>(storedConnectors || [
		{from: 'entry-form', to: 'entry-form-2'},
		{from: 'second-form#option1', to: 'entry-form-4'}
	])
	const [scale, setScale] = React.useState(1)
	const [addMode, setAddMode] = React.useState(null)

	function handleContainerAdd(type: string, coords?: TContainerDescriptor) {
		if(type == 'form') {
			setContainers([
				...containers,
				<Canvas.Container canvasKey={`entry-form-${Math.round(Math.random() * 100)}`}>
					<TestForm className='p-4' />
				</Canvas.Container>,
			])
		} else if(type == 'comment') {
			const key = `comment-bubble-${Math.round(Math.random() * 100)}`
			setContainers([
				...containers,
				<Canvas.Container extra={true} sticky={true} canvasKey={`${key}`}>
					<CommentBubble initials='J' />
				</Canvas.Container>
			])
			setContainerCoordinates(
				extend({}, containerCoordinates, {
					[`${key}`]: extend({}, coords, {extra: true, sticky: true, relative: { left: coords.relative.left, top: coords.relative.top - 32 } })
				})
			)
			setAddMode(null)
		} else if (type == 'note') {
			const key = `note-${Math.round(Math.random() * 100)}`
			setContainers([
				...containers,
				<Canvas.Container extra={true} sticky={true} stickTo='entry-form-3' canvasKey={`${key}`}>
					<Box className='absolute bg-yellow-200 rounded-md w-[96px] h-[96px] shadow-md flex items-center text-center text-sm'>Don’t forget this</Box>
				</Canvas.Container>,
			])
			setContainerCoordinates(
				extend({}, containerCoordinates, {
					[`${key}`]: coords
				})
			)
			setAddMode(null)
		}
	}

	function handleContainerSwap(event) {
		const indexA = findIndex(containers, (container) => container.props.canvasKey == event.objectKey )
		const indexB = findIndex(containers, (container) => container.props.canvasKey == event.placementKey )

		// A[x] = A.splice(y, 1, A[x])[0];
		const newContainers = Array.from(containers)
		newContainers[indexA] = newContainers.splice(indexB, 1, containers[indexA])[0]

		const newCoordinates = swapContainerCoordinates(containerCoordinates, event.objectKey, event.placementKey)

		console.log(event.objectKey, indexA, `→`, event.placementKey, indexB)
		console.log(containerCoordinates, `→`, newCoordinates)
		console.log( map(containers, (i) => i.props.canvasKey), `→`, map(newContainers, (i) => i.props.canvasKey) )
		setContainers(newContainers)
		setContainerCoordinates(newCoordinates)
	}

	
	return <>
		<div className="p-2 w-full h-full overflow-hidden">
			<Canvas
				scale={scale}
				containerCoordinates={containerCoordinates}
				connectors={connectors}
				onLayoutChange={(newLayout) => { setContainerCoordinates(newLayout); storeDescriptors(newLayout) } }
				onOrderChange={(event) => { handleContainerSwap(event) } }
				className="bg-transparent rounded-lg border border-slatedark-6"
				addMode={!!addMode} onPlaceAdd={(coords) => handleContainerAdd(addMode, coords)}
				scroll={<Canvas.Scroller />}
			>
				<Canvas.Layout className='grid w-2/3 m-auto grid-cols-2 grid-flow-row gap-4 p-4 items-start'>
					{filter(containers, (container) => container.props.extra != true)}
				</Canvas.Layout>
				<Canvas.Extras>
					{filter(containers, (container) => container.props.extra == true)}
				</Canvas.Extras>
			</Canvas>
		</div>
		<Toolbar 
			scale={scale} addMode={addMode} 
			onScaleChange={(scale) => setScale(scale)} 
			onAddMode={(type) => setAddMode(type)}
			onReset={() => {removeConnectors(); removeDescriptors(); setConnectors([]); setContainers(containersInitvalue); setContainerCoordinates({})} }
		/>
		</>
};

export default PIndex;
