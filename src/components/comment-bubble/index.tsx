import * as React from 'react'
import { Text, Box } from '@radix-ui/themes'

interface ICommentBubbleProps extends React.HTMLProps<HTMLElement> {
	avatar?: React.ReactElement
	initials: string
}

const CommentBubble: React.FunctionComponent<ICommentBubbleProps> = (props) => {
	const style = `box-border bg-slate-700 rounded-[theme(spacing.6)] p-1 rounded-bl shadow-md opacity-75 hover:opacity-100`
	const {children, avatar, initials, ref, className, ...elementProps} = props

	return <div className={`${className || ''} ${style}`} {...elementProps}>
		<Box className='w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center overflow-hidden cursor-pointer pointer-events-none'>
			<Text className='text-center text-md font-bold text-white'>{props.initials.toUpperCase()}</Text>
		</Box>
	</div>
};

export default CommentBubble;