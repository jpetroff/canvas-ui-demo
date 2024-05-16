import * as React from 'react'
import { RouteObject } from 'react-router-dom'
import { useLocation, useNavigate, useParams } from 'react-router'
import Header from '@apps/header'
import Sidebar from '@apps/sidebar'
import Canvas from '@components/canvas'
import { ICanvasCoordsCollection } from '@components/canvas/types'
import TestForm from '@apps/test-form'
import { Card } from '@radix-ui/themes'

interface IAppProps {
	router?: RouteObject
}

const PIndex: React.FunctionComponent<IAppProps> = (props) => {
	const navigate = useNavigate()
	const location = useLocation()

	const containers = [
		<Canvas.Container key='entry-form'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container key='second-form'>
			<Card className='p-4'>
				<div>Test new</div>
				<div>Second child</div>
				<div>Second child</div>
				<div>Second child</div>
				<div>Second child</div>
				<div>Second child</div>
				<div>Second child</div>
				<div>Second child</div>
			</Card>
		</Canvas.Container>
	]
	const [containerCoordinates, setContainerCoordinates] = React.useState<ICanvasCoordsCollection>({})
	
	return <div className="w-screen h-dvh bg-white grid grid-cols-[theme(spacing.64)_1fr] grid-rows-[theme(spacing.16)_1fr]">
		<Header className="col-span-2 bg-white min-h-5 border-b border-b-slate-100" />
		<Sidebar className="border-r-slate-100 bg-white border-r" />
		<Canvas 
			containers={containers}
			containerCoordinates={containerCoordinates}
			onLayoutChange={newLayout => setContainerCoordinates(newLayout)}
			className="bg-slate2"
		/>
	</div>
};

export default PIndex;
