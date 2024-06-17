import { Card, CardProps, IconButton } from '@radix-ui/themes'
import './style.css'
import * as React from 'react'
import { Cross1Icon } from '@radix-ui/react-icons'

export interface INote extends Omit<React.HTMLProps<HTMLLabelElement>, 'onChange'> {
	message: string
	onRemove?: () => void
	onChange?: (message: string) => void
}

const Note = React.forwardRef<HTMLLabelElement, INote>(
(
	props, forwardref
) => {
	const { message, onRemove, onChange, className, ...intrinsic} = props

	const id = React.useId()
	
	return <label htmlFor={id} ref={forwardref} className={`${className || ''} absolute bg-indigodark-7 rounded-md w-[116px] min-h-[116px] shadow-lg flex items-center text-center text-sm pt-6 pb-6 px-1 opacity-[0.9] hover:opacity-[1]`} {...intrinsic}>
		<IconButton variant='ghost' color='gray' size='1' className='absolute top-0 right-0 m-0'
			onClick={() => onRemove()}
		>
			<Cross1Icon width="14" height="14" />
		</IconButton>
		<div id={id} className='w-full outline-none text-center cursor-text' contentEditable dangerouslySetInnerHTML={ { __html: message } } onBlur={(event) => onChange(event.currentTarget.innerHTML) }  />
	</label>
})

export default Note