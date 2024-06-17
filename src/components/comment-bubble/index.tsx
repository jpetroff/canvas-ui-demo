import * as React from 'react'
import { Text, Box, Popover, Avatar, Flex, TextArea, Checkbox, Button } from '@radix-ui/themes'
import './style.css'

interface ICommentBubbleProps extends Omit<React.HTMLProps<HTMLElement>, 'onChange'> {
	avatar?: React.ReactElement
	initials?: string
	message?: string
	name?: string
	onChange?: (value: string) => void
}

const CommentBubble: React.FunctionComponent<ICommentBubbleProps> = (props) => {
	const style = `box-border bg-indigodark-8 rounded-[theme(spacing.6)] rounded-bl shadow-md`
	const {children, avatar, initials, ref, className, message, onChange, name, ...elementProps} = props

	const [msg, setMsg] = React.useState(message)

	return <div className={`${className || ''} ${style}`} {...elementProps}>
		<Popover.Root defaultOpen={!!(message == '')} onOpenChange={(value) => !value && msg == '' && message == '' && onChange('')}>
			<Popover.Trigger>
				<Flex direction="row" align='start' className='comment-bubble-wrapper w-8 h-8 m-[4px] p-0 hover:gap-2 rounded-full bg-emeralddark-8 flex justify-start overflow-hidden cursor-pointer'>
					{/* <Text className='text-center text-md font-bold text-white'>{props.initials.toUpperCase()}</Text> */}
					<Avatar className='avatar-trigger' src='data:image/jpeg;base64,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' 
						fallback={initials}
						size="2"
						radius="full"
					/>
					<Flex direction="column" gap="0" className='flex-grow'>
						<Text className='comment-expanded-name'>{name}</Text>
						<Text className='comment-expanded-message'>{message}</Text>
					</Flex>
				</Flex>
			</Popover.Trigger>
			<Popover.Content width="240px" size="1" alignOffset={-12}>
				<Flex gap="3">
					<Box flexGrow="1">
						<TextArea placeholder="Write a comment…" size="1" value={msg} onChange={(event) => setMsg(event.target.value)} style={{ height: 80 }} />
						<Flex gap="3" mt="3" justify="between">
							<Popover.Close>
								<Button size="1" onClick={() => onChange(msg)}>Comment</Button>
							</Popover.Close>
						</Flex>
					</Box>
				</Flex>
			</Popover.Content>
		</Popover.Root>
	</div>
};

export default CommentBubble;