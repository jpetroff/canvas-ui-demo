import * as React from 'react'
import { RouteObject } from 'react-router-dom'
import { useLocation, useNavigate, useParams } from 'react-router'

import Header from '@apps/header'
import Sidebar from '@apps/sidebar'
import Canvas from '@components/canvas'
import { ICanvasCoordsCollection } from '@components/canvas/types'
import TestForm from '@apps/test-form'

import { Card, Text, Box } from '@radix-ui/themes'
import CommentBubble from '@components/comment-bubble'

interface IAppProps {
	router?: RouteObject
}

const PIndex: React.FunctionComponent<IAppProps> = (props) => {
	const navigate = useNavigate()
	const location = useLocation()

	function handleClick() {
		console.log('!')
	}

	const containers = [
		<Canvas.Container key='entry-form'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container key='second-form' connectTo='entry-form-2'>
			<Card className='p-4' onClick={handleClick}>
				<div>Test new</div>
				<div>Second child</div>
				<div>Second child</div>
				<div>Second child</div>
				<div>Second child</div>
				<div>Second child</div>
				<div>Second child</div>
				<div>Second child</div>
			</Card>
		</Canvas.Container>,
		<Canvas.Container key='entry-form-2'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container key='entry-form-3'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container key='entry-form-4'>
			<TestForm className='p-4' />
		</Canvas.Container>,
		<Canvas.Container isExtra={true} boundTo='entry-form-3' key='entry-form-3-note'>
			<Box className='absolute bg-yellow-200 rounded-md w-[96px] h-[96px] shadow-md flex items-center text-center text-sm'>Don’t forget this</Box>
		</Canvas.Container>,
		<Canvas.Container isExtra={true} boundTo='entry-form-2' key='entry-form-2-comment' top={10} left={24} >
			<CommentBubble initials='J' />
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
