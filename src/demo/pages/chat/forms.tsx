import { Card, TextArea, Text, TextField, Select, RadioCards, Box, DataList, Flex, Tooltip, IconButton, Button, Separator } from '@radix-ui/themes'
import { QuestionMarkIcon, InfoCircledIcon, TextIcon, ChatBubbleIcon, Share1Icon, KeyboardIcon, CardStackIcon, ThickArrowRightIcon, TrashIcon } from '@radix-ui/react-icons'
import * as React from 'react'
import Field from '@components/field'
import CodeMirror from 'react-codemirror'
import { clone, cloneDeep, debounce, defer, findIndex, indexOf } from 'lodash'
import Canvas from '@components/canvas'
import { fieldMappings } from './form-setup'

export const FlowIcon = (
<svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	<path fill-rule="evenodd" clip-rule="evenodd" d="M10.1464 2.14645C10.3417 1.95118 10.6583 1.95118 10.8536 2.14645L12.8536 4.14645C13.0488 4.34171 13.0488 4.65829 12.8536 4.85355L10.8536 6.85355C10.6583 7.04882 10.3417 7.04882 10.1464 6.85355C9.95118 6.65829 9.95118 6.34171 10.1464 6.14645L11.2929 5H9.01736C7.94815 5 7.38434 5.30676 6.99815 5.82092C6.57067 6.39005 6.31202 7.27068 6.03584 8.55711C5.98653 8.78683 5.94006 9.01437 5.89488 9.2356C5.81908 9.60674 5.74692 9.96011 5.67101 10.2762C5.54828 10.7874 5.40169 11.2674 5.17417 11.6752C4.94009 12.0946 4.61909 12.4399 4.15837 12.6723C3.70739 12.8997 3.1598 13 2.5 13C2.22386 13 2 12.7761 2 12.5C2 12.2239 2.22386 12 2.5 12C3.06577 12 3.44346 11.9128 3.70812 11.7794C3.96304 11.6508 4.14803 11.4619 4.30093 11.1879C4.46039 10.9021 4.58178 10.5295 4.69864 10.0428C4.77132 9.74011 4.8369 9.41854 4.9094 9.06303C4.95506 8.83913 5.00347 8.60178 5.05812 8.3472C5.32893 7.08578 5.62023 5.99034 6.19857 5.22035C6.81821 4.39539 7.71609 4 9.01736 4H11.2929L10.1464 2.85355C9.95118 2.65829 9.95118 2.34171 10.1464 2.14645Z" fill="currentColor"/>
</svg>
)

/*
	=======================================================================
	Intent Form
	=======================================================================
*/

export interface IChatBlock {
	blockId: string
	content: {field: string, [key: string]: any}[]
	onFormChange: (props: any) => void
	onFlowAdd: (from: string) => void
	onFlowRemove: (key: string) => void
	className?: string
	canvasKey: string
}

export const ChatBlock = React.forwardRef<HTMLDivElement, IChatBlock>( (
	props, forwardRef
) => {
	const {
		blockId, content, onFormChange, onFlowAdd, className, ...intrinsicProps
	} = props

	function handleChange(content) {
		props.onFormChange(
			{
				content: content
			}
		)
	}

	function onFieldChange(index: number, fieldType: string, values: any) {
		const newContent = Array.from(content)
		console.log(index, fieldType, values)
		if(index != -1) {
			newContent[index] = {...fieldMappings[fieldType].props, ...values}
		} else {
			newContent.push({...fieldMappings[fieldType].props, ...values})
		}
		handleChange(newContent)
	}

	function handleAddField(fieldType: string) {
		const newContent = Array.from(content)
		newContent.push({
			...fieldMappings[fieldType].props
		})
		handleChange(newContent)
	}

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5 flex flex-col gap-3`} {...intrinsicProps}>
		{content.map( 
			( fieldObject, index ) => {
				const FieldComponent = fieldMappings[fieldObject.field].component
				const flowAddProp = FieldComponent.displayName == 'FChoice' ? { onFlowAdd } : {}
				console.log(`Flow prop pass`, flowAddProp, FieldComponent.displayName)
				return (
					<FieldComponent 
						key={`${fieldObject.field}-${index}`} 
						_block={`${props.blockId}~${index}`} 
						onFieldChange={(values) => onFieldChange(index, fieldObject.field, values)}
						{ ...fieldObject } 
						{ ...flowAddProp }
					/>
				)
			})
		}

		<Flex direction="row" gap="1" align="center">

			<Tooltip content="Add text reply">
				<IconButton variant='soft' color='gray' className='cursor-pointer' onClick={() => handleAddField('text')}>
					<ChatBubbleIcon />
				</IconButton>
			</Tooltip>

			<Tooltip content="Add choice">
				<IconButton variant='soft' color='gray' className='cursor-pointer' onClick={() => handleAddField('choice')}>
					<Share1Icon />
				</IconButton>
			</Tooltip>

			<Tooltip content="Wait for text answer">
				<IconButton variant='soft' color='gray' className='cursor-pointer' onClick={() => handleAddField('answer')}>
					<KeyboardIcon />
				</IconButton>
			</Tooltip>

			<Tooltip content="Add card">
				<IconButton variant='soft' color='gray' className='cursor-pointer' onClick={() => handleAddField('card')}>
					<CardStackIcon />
				</IconButton>
			</Tooltip>

			<div className="flex-grow h-1"></div>

			<Tooltip content="Delete flow">
				<IconButton variant='ghost' color='red' className='cursor-pointer m-0 h-8 w-8 box-border' onClick={() => props.onFlowRemove(props.canvasKey)}>
					<TrashIcon />
				</IconButton>
			</Tooltip>

		</Flex>
	</Card>
})

interface IField {
	field: string
	_block: string
	onFieldChange: (values: any) => void
}

/* 
	Text
*/

export interface ITextField extends IField {
	value: string
	label?: string
}

export const FText = React.forwardRef<HTMLDivElement, ITextField>(
	( 
		props,
		forwardRef
	) => {

		return <Field>
			{props.label || 'Bot replies with text:'}
			<TextArea resize="vertical" className='chat-bubble-input rounded-[1rem] rounded-bl bg-slatedarka-3 hover:bg-slatedarka-4 border-none' value={props.value} onChange={(event) => props.onFieldChange({value: event.target.value}) } />
			<Separator className='-mx-5 my-4 w-auto' />
		</Field>
	}
)

/* 
	Choice
*/

export interface IChoiceField extends IField {
	choices: {value: string, connectorName?: string}[]
	onButtonAdd: () => void 
	onFlowAdd: (name: string) => void 
	label?: string
}

export const FChoice = React.forwardRef<HTMLDivElement, IChoiceField>(
	( 
		props,
		forwardRef
	) => {

		function editChoice(index, value, connector) {
			let newChoices = Array.from(props.choices)
			newChoices[index].value = value
			newChoices[index].connectorName = connector
			props.onFieldChange({
				choices: newChoices
			})
		}

		function removeChoice(index) {
			let newChoices = Array.from(props.choices)
			newChoices.splice(index, 1)
			props.onFieldChange({
				choices: newChoices
			})
		}

		function handleAddReply(connector) {
			let newChoices = Array.from(props.choices)
			newChoices.push({
				value: '',
				connectorName: connector
			})
			props.onFieldChange({
				choices: newChoices
			})
		}

		console.log(`Flow add`, props.onFlowAdd)

		return <Field nolabel>
			{props.label || 'Wait for user answer:'}
			{props.choices.map(
				( item, index ) => {
					const sectionName = item.connectorName || `${props._block}~${index}`
					return <Canvas.Section canvasKey={sectionName} ><Flex direction="row" align={`center`} gap="3">
						<div className='flex-grow flex h-8 cursor-auto'>
							<TextField.Root className={`flex flex-grow min-w-8 bg-slatedarka-3 hover:bg-slatedarka-4 rounded-full border-none chat-bubble-input`} 
								value={item.value}
								onChange={(event) => editChoice(index, event.target.value, sectionName)}
							/>
						</div>

						<Tooltip content='Delete reply'>
							<IconButton variant='ghost' color='gray' size="3" onClick={() => removeChoice(index)}>
								<TrashIcon />
							</IconButton>
						</Tooltip>

						<Tooltip content='Create new flow'>
							<IconButton variant='ghost' color='gray' size="3" onClick={() => props.onFlowAdd(sectionName)}>
								{FlowIcon}
							</IconButton>
						</Tooltip>
						
					</Flex></Canvas.Section>
				}
			)}
			<Button className='rounded-full w-auto flex-shrink flex-grow-0 flex py-0 self-start px-4 cursor-pointer' size='2' variant='soft' color='gray'
				onClick={() => handleAddReply(`${props._block}~${props.choices.length}`)}
			>
				Add reply button
			</Button>
			<Separator className='-mx-5 my-4 w-auto' />
		</Field>
	}
)

FChoice.displayName = 'FChoice'