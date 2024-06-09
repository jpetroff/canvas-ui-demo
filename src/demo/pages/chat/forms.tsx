import { Card, TextArea, Text, TextField, Select, RadioCards, Box, DataList, Flex, Tooltip, IconButton, Button, Separator, Badge, Switch } from '@radix-ui/themes'
import { QuestionMarkIcon, InfoCircledIcon, TextIcon, ChatBubbleIcon, Share1Icon, KeyboardIcon, CardStackIcon, ThickArrowRightIcon, TrashIcon, MagicWandIcon, LightningBoltIcon, ArrowRightIcon } from '@radix-ui/react-icons'
import * as React from 'react'
import Field from '@components/field'
import CodeMirror from '@uiw/react-codemirror'
import { loadLanguage, langNames, langs } from '@uiw/codemirror-extensions-langs'
import { clone, cloneDeep, debounce, defer, extend, find, findIndex, indexOf } from 'lodash'
import Canvas from '@components/canvas'
import { fieldMappings } from './form-setup'
import { xcodeDark } from '@uiw/codemirror-theme-xcode'

function rnd() : string {
	return String(
		Math.round(Math.random() * 10000)
	)
}

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
	existingFlows: {key: string, name: string}[]
	onFormChange: (props: any, flow?: any) => void
	onFlowRemove: (key: string) => void
	className?: string
	canvasKey: string
}

export const ChatBlock = React.forwardRef<HTMLDivElement, IChatBlock>( (
	props, forwardRef
) => {
	const {
		blockId, content, onFormChange, className, existingFlows, ...intrinsicProps
	} = props

	const selfKey = props['data-key']

	function handleChange(content, flow?) {
		props.onFormChange(
			{
				content: content
			},
			flow
		)
	}

	function onFieldChange(index: number, fieldType: string, values: any, flow: any) {
		const newContent = Array.from(content)
		console.log(index, fieldType, values)
		if(index != -1) {
			newContent[index] = {...fieldMappings[fieldType].props, ...values}
		} else {
			newContent.push({...fieldMappings[fieldType].props, ...values})
		}
		handleChange(newContent, flow)
	}

	function handleAddField(fieldType: string) {
		const newContent = Array.from(content)
		newContent.push({
			...fieldMappings[fieldType].props
		})
		handleChange(newContent)
	}

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5 flex flex-col gap-3`} {...intrinsicProps}>
		<Canvas.Section canvasKey={`${selfKey}~top`}>
			<Flex>
			<Badge color='plum' className='flex w-auto'>
				{String(find(existingFlows, {key: selfKey}).name)}
			</Badge>
			</Flex>
		</Canvas.Section>
		{content.map( 
			( fieldObject, index ) => {
				const FieldComponent = fieldMappings[fieldObject.field].component
				const existingFlowsProp = ['FGoTo', 'FScript'].indexOf(FieldComponent.displayName) != -1 ? { existingFlows } : {}
				return (
					<FieldComponent 
						key={`${fieldObject.field}-${index}`} 
						_block={`${props.blockId}~${index}`}
						onFieldChange={(values, flow) => onFieldChange(index, fieldObject.field, values, flow)}
						{ ...fieldObject } 
						{ ...existingFlowsProp }
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
				<IconButton variant='soft' color='gray' className='cursor-pointer' onClick={() => handleAddField('reply')}>
					<KeyboardIcon />
				</IconButton>
			</Tooltip>

			<Tooltip content="Add script">
				<IconButton variant='soft' color='gray' className='cursor-pointer' onClick={() => handleAddField('script')}>
					<LightningBoltIcon />
				</IconButton>
			</Tooltip>

			<Tooltip content="Go to">
				<IconButton variant='soft' color='gray' className='cursor-pointer' onClick={() => handleAddField('goto')}>
					{FlowIcon}
				</IconButton>
			</Tooltip>

			<div className="flex-grow h-1"></div>

			{selfKey != 'chat-flow-start' && <Tooltip content="Delete flow">
				<IconButton variant='ghost' color='red' className='cursor-pointer m-0 h-8 w-8 box-border' onClick={() => props.onFlowRemove(props.canvasKey)}>
					<TrashIcon />
				</IconButton>
			</Tooltip>}

		</Flex>
	</Card>
})

interface IField {
	field: string
	_block: string
	onFieldChange: (values: any, flow?: {from: string, to?: string}) => void
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
	existingFlows: {key: string, name: string}[]
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

		function handleFlowAdd(from: string) {
			props.onFieldChange({}, {from})
		}

		return <Field nolabel>
			{props.label || 'Wait for user answer:'}
			{props.choices.map(
				( item, index ) => {
					const sectionName = item.connectorName || `${props._block}~${rnd()}`
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
							<IconButton variant='ghost' color='gray' size="3" onClick={() => handleFlowAdd(sectionName)}>
								{FlowIcon}
							</IconButton>
						</Tooltip>
						
					</Flex></Canvas.Section>
				}
			)}
			<Button className='rounded-full w-auto flex-shrink flex-grow-0 flex py-0 self-start px-4 cursor-pointer' size='2' variant='soft' color='gray'
				onClick={() => handleAddReply(`${props._block}~reply~${rnd()}`)}
			>
				Add reply button
			</Button>
			<Separator className='-mx-5 my-4 w-auto' />
		</Field>
	}
)

FChoice.displayName = 'FChoice'



/* 
	User Text Reply
*/

export interface IReplyField extends IField {
	choices: {value: string, connectorName?: string}[]
	script: string
	hasChoices: boolean
	save: boolean
	variable: string
	onButtonAdd: () => void 
	existingFlows: {key: string, name: string}[]
	onScriptAdd: () => void
}

export const FReply = React.forwardRef<HTMLDivElement, IReplyField>(
	( 
		props,
		forwardRef
	) => {

		function handleChange(value: any) {
			props.onFieldChange( extend({}, props, value) )
		}

		function editChoice(index, value, connector) {
			let newChoices = Array.from(props.choices)
			newChoices[index].value = value
			newChoices[index].connectorName = connector
			handleChange({
				choices: newChoices
			})
		}

		function removeChoice(index) {
			let newChoices = Array.from(props.choices)
			newChoices.splice(index, 1)
			handleChange({
				choices: newChoices
			})
		}

		function handleAddReply(connector) {
			let newChoices = Array.from(props.choices)
			newChoices.push({
				value: '',
				connectorName: connector
			})
			handleChange({
				choices: newChoices
			})
		}

		function handleFlowAdd(from: string) {
			props.onFieldChange({}, {from})
		}

		return <Field nolabel>
			Wait for user text reply:
			<div className='bg-slatedarka-3 h-8 w-full flex rounded flex-row items-center gap-2 px-2'>
				<KeyboardIcon /><ArrowRightIcon /><Badge size="1" className='font-mono'>{props.variable ? `{{ ${props.variable} }}` : `{{user_reply}}`}</Badge>
			</div>
			<Field className='flex flex-row gap-1 items-center h-8' >
				<Switch size="1" checked={props.save} onClick={ () => handleChange({save: !props.save}) }/> Save reply for later {props.save ? 'as' : ''}
			</Field>
			{props.save && <Field>
				<TextField.Root value={props.variable} onChange={ (event) => handleChange({variable: event.target.value}) } />
			</Field>}

			<Field className='flex flex-row gap-1 items-center h-8' >
				<Switch size="1" checked={props.hasChoices} onClick={ () => handleChange({hasChoices: !props.hasChoices}) }/> Analyze content
				<Tooltip content="AI will determine if content below matches the topic in user reply" maxWidth="4">
					<MagicWandIcon />
				</Tooltip>
			</Field>
			{props.hasChoices && <Text size="1" className='text-slatedark-10'>If user reply matches content or topic:</Text>}
			{props.hasChoices && props.choices.map(
				( item, index ) => {
					const sectionName = item.connectorName || `${props._block}~${rnd()}`
					return <Canvas.Section canvasKey={sectionName} ><Flex direction="row" align={`center`} gap="3">
						<div className='flex-grow flex h-8 cursor-auto'>
							<TextField.Root className={`flex flex-grow min-w-8`} 
								value={item.value}
								onChange={(event) => editChoice(index, event.target.value, sectionName)}
								placeholder='Describe content of user reply'
							/>
						</div>

						<Tooltip content='Delete variant'>
							<IconButton variant='ghost' color='gray' size="3" onClick={() => removeChoice(index)}>
								<TrashIcon />
							</IconButton>
						</Tooltip>

						<Tooltip content='Create new flow'>
							<IconButton variant='ghost' color='gray' size="3" onClick={() => handleFlowAdd(sectionName)}>
								{FlowIcon}
							</IconButton>
						</Tooltip>
						
					</Flex></Canvas.Section>
				}
			)}
			{props.hasChoices && <Button className='w-auto flex-shrink flex-grow-0 flex py-0 self-start cursor-pointer' size='2' variant='soft' color='gray'
				onClick={() => handleAddReply(`${props._block}~${rnd()}`)}
			>
				Add variant
			</Button>}
			<Separator className='-mx-5 my-4 w-auto' />
		</Field>
	}
)

FReply.displayName = 'FReply'

/* 
	Go to
*/

export interface IGoToField extends IField {
	existingFlows: {key: string, name: string}[]
	value: string
	_block: string
	onFlowAdd: (from: string, to?: string) => void
}

export const FGoTo = React.forwardRef<HTMLDivElement, IGoToField>(
	(
		props, forwardRef
	) => {
		const { value, existingFlows, onFlowAdd, _block, onFieldChange, ...intrinsicProps } = props

		const id = React.useId()

		const sectionName = `${_block}~goto`

		function handleChange(value: string) {
			onFieldChange({value: value}, {from: sectionName, to: value == '___new-flow' ? void 0 : value})
		}

		return (
			<Field>
				Go to flow
				<Canvas.Section canvasKey={sectionName}>
				<Flex direction="column">
				<Select.Root 
					value={value} 
					onValueChange={handleChange}
				>
						<Select.Trigger aria-label="LLM Model" placeholder="Choose or create flow " />
						<Select.Content role="dialog"
							aria-label="Languages"
							// position="popper"
							sideOffset={4}
							className='popover-max-height'
						>
							{existingFlows &&	existingFlows.map((flow, index) => (
									<Select.Item key={`${flow.key}~${index}`} value={flow.key} className=''>{flow.name}</Select.Item>
								))
							}
							<Select.Item value={'___new-flow'} className=''>Create new</Select.Item>
						</Select.Content>
				</Select.Root>
				</Flex>
				</Canvas.Section>
				<Separator className='-mx-5 my-4 w-auto' />
			</Field>
		)
	}
)

FGoTo.displayName = 'FGoTo'


/* 
	Script
*/

export interface IScriptField extends IField {
	existingFlows: {key: string, name: string}[]
	value: string
	_block: string
	choices: {value: string, connector: string, dest: string}[]
}

const options ={
	foldGutter: false,
	dropCursor: false,
	allowMultipleSelections: false,
	indentOnInput: false,
	lineNumbers: false
}

export const FScript = React.forwardRef<HTMLDivElement, IScriptField>(
	(
		props, forwardRef
	) => {
		const { value, existingFlows, onFieldChange, _block, choices, ...intrinsicProps } = props

		function handleChange(valueObj: any, flow?: {from: string, to: string}) {
			onFieldChange({ value, choices, ...valueObj}, flow)
		}

		function editChoice(index, value) {
			let newChoices = Array.from(choices)
			newChoices[index].value = value
			handleChange({
				choices: newChoices
			})
		}

		function removeChoice(index) {
			let newChoices = Array.from(choices)
			newChoices.splice(index, 1)
			handleChange({
				choices: newChoices
			})
		}

		function addChoice(connector) {
			let newChoices = Array.from(choices)
			newChoices.push({
				value: '',
				connector: connector,
				dest: ''
			})
			handleChange({
				choices: newChoices
			})
		}

		function changeConnector(connector, index, sectionName) {
			console.log(`ch conn`, connector)
			let newChoices = Array.from(choices)
			newChoices[index].dest = connector
			handleChange(
				{
					choices: newChoices
				},
				{
					from: sectionName,
					to: connector == '___new-flow' ? void 0 : connector
				}
			)
		}

		return (
			<Flex direction="column" gap="2">
			<Field>
				Perform a script
				<CodeMirror 
					value={value} onChange={(value) => handleChange({value: value})}
					extensions={[langs.javascript()]}
					theme={xcodeDark}
					basicSetup={options}
					className='codemirror-theme font-mono text-xs'
					height='auto'
					minHeight='100px'
				/>
			</Field>
			<Field nolabel>
				Go to flow if function returns:

				{choices && choices.map(
					(item, index) => {
						const sectionName = item.connector || `${props._block}~script~${rnd()}`
						return <Canvas.Section canvasKey={sectionName} >
							<Flex direction="column" gap="1">
								<Flex direction="row" align={`center`} gap="3">
									<div className='flex-grow flex h-8 cursor-auto'>
										<TextField.Root className={`flex flex-grow min-w-8`} 
											value={item.value}
											onChange={(event) => editChoice(index, event.target.value)}
											placeholder='When script returns...'
										/>
									</div>

									<Tooltip content='Delete variant'>
										<IconButton variant='ghost' color='gray' size="3" onClick={() => removeChoice(index)}>
											<TrashIcon />
										</IconButton>
									</Tooltip>
								</Flex>
								<Select.Root 
									value={item.dest} 
									onValueChange={(value) => changeConnector(value, index, sectionName)}
								>
									<Select.Trigger aria-label="LLM Model" placeholder="Choose or create flow " />
									<Select.Content role="dialog"
										aria-label="Languages"
										// position="popper"
										sideOffset={4}
										className='popover-max-height'
									>
										{existingFlows &&	existingFlows.map((flow, index) => (
												<Select.Item key={`${flow.key}~${index}`} value={flow.key} className=''>{flow.name}</Select.Item>
											))
										}
										<Select.Item value={'___new-flow'} className=''>Create new</Select.Item>
									</Select.Content>
								</Select.Root>
							</Flex>
						</Canvas.Section>
					}
				)}

				<Button className='w-auto flex-shrink flex-grow-0 flex py-0 self-start cursor-pointer' size='2' variant='soft' color='gray'
					onClick={() => addChoice(`${_block}~script~${rnd()}`)}
				>
					Add variant
				</Button>
			</Field>
			<Separator className='-mx-5 my-4 w-auto' />
			</Flex>
		)
	}
)

FScript.displayName = 'FScript'