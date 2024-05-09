import * as React from 'react'
import { RouteObject } from 'react-router-dom'
import { useLocation, useNavigate, useParams } from 'react-router'
import Header from '@apps/header'
import Sidebar from '@apps/sidebar'
import Canvas from '@components/canvas'

interface IAppProps {
	router?: RouteObject
}

const PIndex: React.FunctionComponent<IAppProps> = (props) => {
	const navigate = useNavigate()
	const location = useLocation()

	const containers = [
		<Canvas.Container className='p-4' key='entry-form' >
			<div>Test</div>
			<div>Second child</div>
		</Canvas.Container>,
		<Canvas.Container className='p-4' key='second-form' >
			<div>Test</div>
			<div>Second child</div>
			<div>Second child</div>
			<div>Second child</div>
			<div>Second child</div>
			<div>Second child</div>
			<div>Second child</div>
			<div>Second child</div>
		</Canvas.Container>
	]
	
	return <div className="w-screen h-dvh bg-white grid grid-cols-[theme(spacing.64)_1fr] grid-rows-[theme(spacing.16)_1fr]">
		<Header className="col-span-2" />
		<Sidebar />
		<Canvas containers={containers} />
	</div>
};

export default PIndex;
