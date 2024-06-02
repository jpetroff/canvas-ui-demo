import * as React from 'react'
import Scaler from '@components/scale-control'
import { Separator, IconButton } from '@radix-ui/themes'
import { ChatBubbleIcon, Cross1Icon, Pencil2Icon } from '@radix-ui/react-icons'

export interface IToolbarProps {
	children?: React.ReactNode
	scale: number
	addMode: string | null
	onScaleChange: (scale: number) => void
	onAddMode: (type: string | null) => void
}

const Toolbar : React.FunctionComponent<IToolbarProps> = (
	props
) => {

	return <div className='px-3 py-2 rounded bg-slatedark-6 backdrop-blur-lg bg-opacity-25 absolute bottom-8 right-8 border border-slatedark-6 shadow-lg flex flex-row gap-2.5'>
			<Scaler className='gap-2.5' 
				currentScale={props.scale}
				min={0.5} max={1} step={0.1}
				onScaleChange={(newScale) => props.onScaleChange(newScale)} 
			/>
			{/* <div className='w-px bg-slate-200 ml-1 mr-1 self-start-end'></div> */}
			<Separator orientation="vertical" />
			{props.addMode != 'comment' &&
				<IconButton size="1" color="gray" variant="ghost" onClick={() => props.onAddMode('comment')}>
					<ChatBubbleIcon />
				</IconButton>
			}
			{props.addMode == 'comment' && 
				<IconButton size="1" color="gray" variant="ghost" onClick={() => props.onAddMode(null)}>
					<Cross1Icon />
				</IconButton>
			}
			{props.addMode != 'note' &&
				<IconButton size="1" color="gray" variant="ghost" onClick={() => props.onAddMode('note')}>
					<Pencil2Icon />
				</IconButton>
			}
			{props.addMode == 'note' && 
				<IconButton size="1" color="gray" variant="ghost" onClick={() => props.onAddMode(null)}>
					<Cross1Icon />
				</IconButton>
			}
		</div>
}

export default Toolbar