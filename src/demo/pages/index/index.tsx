import * as React from 'react'
import { RouteObject } from 'react-router-dom'
import { useLocation, useNavigate, useParams } from 'react-router'

import Header from '@apps/header'
import Sidebar from '@apps/sidebar'
import Canvas from '@components/canvas'
// import type { TContainerCoordCollection, TConnectorDescription, TConnectorDescriptionList } from '@components/canvas/types'
import TestForm from '@apps/test-form'

import { Card, Text, Box, Button } from '@radix-ui/themes'
import CommentBubble from '@components/comment-bubble'
import { filter } from 'lodash'

interface IAppProps {
	router?: RouteObject
}

const PIndex: React.FunctionComponent<IAppProps> = (props) => {
	const navigate = useNavigate()
	const location = useLocation()

	const [containers, setContainers] = React.useState([
		<Canvas.Container canvasKey='entry-form' key='entry-form'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container canvasKey='second-form' key='second-form'>
			<Card className='p-4'>
				<React.Fragment key='dsiqjfi0oqwejdfsefkinn'>
					<p>Test new</p>
					<p className='dsada'>Second child 1</p>
					<p>Second child 2</p>
					<Canvas.Section canvasKey='second-form#option1'>
						<p>Named section 3</p>
					</Canvas.Section>
				</React.Fragment>
			</Card>
		</Canvas.Container>,
		<Canvas.Container canvasKey='entry-form-2' key='entry-form-2'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container canvasKey='entry-form-3' key='entry-form-3'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container canvasKey='entry-form-4' key='entry-form-4'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container isExtra={true} canBound={true} boundTo='entry-form-3' canvasKey='entry-form-3-note' key='entry-form-3-note'>
			<Box className='absolute bg-yellow-200 rounded-md w-[96px] h-[96px] shadow-md flex items-center text-center text-sm'>Don’t forget this</Box>
		</Canvas.Container>,
		<Canvas.Container isExtra={true} canBound={true} canvasKey='entry-form-2-comment' key='entry-form-2-comment' top={10} left={24} >
			<CommentBubble initials='J' />
		</Canvas.Container>
	])
	const [containerCoordinates, setContainerCoordinates] = React.useState<IContainerDescriptorPropCollection>({})
	const [connectors, setConnectors] = React.useState<TConnectorPathList>([
		{from: 'entry-form', to: 'entry-form-2'},
		{from: 'second-form#option1', to: 'entry-form-4'}
	])

	function handleContainerAdd() {
		setContainers([
			...containers,
			<Canvas.Container canvasKey={`entry-form-${containers.length}`}>
				<TestForm className='p-4' />
			</Canvas.Container>,
		])
	}
	
	return <div className="w-screen h-dvh bg-white grid grid-cols-[theme(spacing.64)_1fr] grid-rows-[theme(spacing.16)_1fr]">
		<Header className="col-span-2 bg-white min-h-5 border-b border-b-slate-100" />
		<Sidebar className="border-r-slate-100 bg-white border-r">
			<Button onClick={handleContainerAdd}>Create new container</Button>
		</Sidebar>
		<Canvas 
			containers={containers}
			containerCoordinates={containerCoordinates}
			connectors={connectors}
			onLayoutChange={(newLayout) => { setContainerCoordinates(newLayout) } }
			className="bg-slate2"
		>
			<Canvas.Layout className='grid w-2/3 m-auto grid-cols-2 grid-flow-row gap-4 p-4 items-start'>
				{filter(containers, (container) => container.props.isExtra != true)}
			</Canvas.Layout>
			<Canvas.Extras>
				{filter(containers, (container) => container.props.isExtra == true)}
			</Canvas.Extras>
		</Canvas>
	</div>
};

export default PIndex;
