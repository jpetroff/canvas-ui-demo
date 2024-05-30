import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Text, Flex, ScrollArea } from '@radix-ui/themes'
import { ArrowRightIcon, CaretDownIcon } from '@radix-ui/react-icons'
import './style.css'

type NestedComponent<T> = React.FunctionComponent<T> & {
	Section: typeof Section
}

interface ISidebarProps extends React.HTMLProps<HTMLElement> {
	children?: React.ReactElement
}

const Sidebar: NestedComponent<ISidebarProps> = (props) => {
	const location = useLocation()

	return <div className={`${props.className || ''} pr-0 pl-6 py-2 h-full w-full`}>
		<ScrollArea scrollbars="vertical">
			<Flex direction="column" gap="1">

				<Flex direction="column" gap="3" asChild>
					<Link to="/" data-active={location.pathname == '/' ? '' : void 0} className='flex flex-col px-5 py-4 text-sm bg-slatedark-8 bg-opacity-40 hover:bg-slatedark-7 text-slatedark-12 hover:text-white rounded-lg grow data-[active]:bg-[color:var(--accent-8)]'>
						<Text size="4" className='flex flex-row items-center' >
							<span className='flex-grow'>Debug test</span>
							{location.pathname == '/' && <ArrowRightIcon width="20" height="20" />}
						</Text>
						<Text size="1" className='text-slatedark-12 text-opacity-75 font-medium line-clamp-2'>Not a real example</Text>
					</Link>
				</Flex>

				<Flex direction="column" gap="3" asChild>
					<Link to="/ai" data-active={location.pathname == '/ai' ? '' : void 0} className='flex flex-col px-5 py-4 text-sm menu-item-bg text-slatedark-12 hover:text-white rounded-lg grow data-[active]:bg-[color:var(--accent-8)]'>
						<Text size="4" className='flex flex-row items-center' >
							<span className='flex-grow'>LLM test setup</span>
							{location.pathname == '/ai' && <ArrowRightIcon width="20" height="20" />}
						</Text>
						<Text size="1" className='text-slatedark-12 text-opacity-75 font-medium line-clamp-2'>
							Create a setup of chosen LLM, data set and embeddings model, define quality metrics
						</Text>
					</Link>
				</Flex>

				<Flex direction="column" gap="3" asChild>
					<Link to="/chat" data-active={location.pathname == '/chat' ? '' : void 0} className='flex flex-col px-5 py-4 text-sm menu-item-bg text-slatedark-12 hover:text-white rounded-lg grow data-[active]:bg-[color:var(--accent-8)]'>
						<Text size="4" className='flex flex-row items-center' >
							<span className='flex-grow'>Chat conversation</span>
							{location.pathname == '/chat' && <ArrowRightIcon width="20" height="20" />}
						</Text>
						<Text size="1" className='text-slatedark-12 text-opacity-75 font-medium line-clamp-2'>
							Define chatbot conversation paths
						</Text>
					</Link>
				</Flex>

				<Flex direction="column" gap="3" asChild>
					<Link to="/auto" data-active={location.pathname == '/auto' ? '' : void 0} className='flex flex-col px-5 py-4 text-sm menu-item-bg text-slatedark-12 hover:text-white rounded-lg grow data-[active]:bg-[color:var(--accent-8)]'>
						<Text size="4" className='flex flex-row items-center' >
							<span className='flex-grow'>Simple automation</span>
							{location.pathname == '/auto' && <ArrowRightIcon width="20" height="20" />}
						</Text>
						<Text size="1" className='text-slatedark-12 text-opacity-75 font-medium line-clamp-2'>
							Create automation flow for your daily tasks
						</Text>
					</Link>
				</Flex>


			</Flex>	
		</ScrollArea>
	</div>
}

interface ISidebarSectionProps {
	children?: React.ReactNode
}

const Section: React.FunctionComponent<ISidebarSectionProps> = (props) => {
	return <div>
		{props.children}
	</div>
}


Sidebar.Section = Section
export default Sidebar