import { Card, TextArea, Text, TextField, Select, RadioCards, Box, DataList, Flex, Tooltip, IconButton, Button } from '@radix-ui/themes'
import { QuestionMarkIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import * as React from 'react'
import Field from '@components/field'
import CodeMirror from 'react-codemirror'
import { defer, indexOf } from 'lodash'
import Canvas from '@components/canvas'

/*
	=======================================================================
	Intent Form
	=======================================================================
*/

export interface IIntentForm {
	value: string
	placeholder: string
	onFormChange: (props: any) => void
	className?: string
}

export const IntentForm = React.forwardRef<HTMLDivElement, IIntentForm>( (
	props, forwardRef
) => {
	const {
		value, placeholder, onFormChange, className, ...intrinsicProps
	} = props

	function handleChange(event) {
		console.log(event)
		props.onFormChange(
			{
				value: event.target.value
			}
		)
	}

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5 `} {...intrinsicProps}>
		<Field>
			<span>AI assistant intent</span>
			<TextArea resize="vertical" placeholder={`Describe the use case for this AI bot`} value={props.value} onChange={handleChange}/>
		</Field>
	</Card>
})


/*
	=======================================================================
	Model Form
	=======================================================================
*/

export interface IModelForm {
	model: string
	options: {value: string, label: string, meta: string}[]
	apiKey?: string,
	maxNewTokens?: number,
	contextWindow?: number,
	temp?: number
	onFormChange: (props: any) => void
	className?: string
}

export const ModelForm = React.forwardRef<HTMLDivElement, IModelForm>( (
	props, forwardRef
) => {
	const {
		model, onFormChange, className, options, apiKey, maxNewTokens, contextWindow, temp, ...intrinsicProps
	} = props

	function handleChange(prop, value) {
		console.log(value)
		props.onFormChange(
			{
				[prop]: value
			}
		)
	}

	console.log(props)

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5  gap-4 flex flex-col`} {...intrinsicProps}>
		<Field>
			<span>LLM model</span>
			<Select.Root 
				value={props.model} 
				onValueChange={(value) => handleChange('model', value)}
			>
					<Select.Trigger aria-label="LLM Model" placeholder="Choose model you want to try" style={ {[`--select-trigger-height` as any]: 'calc(32px * 1.5)' }} />
					<Select.Content role="dialog"
          	aria-label="Languages"
          	position="popper"
						sideOffset={4}
						style={ {[`--select-item-height` as any]: 'calc(32px * 1.5)' }}
						className='popover-max-height'
					>
						{options.length ? ( 
							options.map((opt) => (
								<Select.Item value={opt.value}>
									<Flex direction='column' gap="0.5">
										<Text>{opt.label}</Text>
										<Text size="1" className='text-slatedarka-10'>{opt.meta}</Text>
									</Flex>
								</Select.Item>
							))
						) : (
							<div className="no-results">No results found</div>
						)}
					</Select.Content>
			</Select.Root>
		</Field>

		{model && indexOf(['gpt-4', 'gpt-40', 'gpt-turbo', 'l3'], model) != -1 && 
			<>
				<Field>
					API key
					<TextArea className='url-input text-xs font-mono' resize="vertical" rows={3} placeholder={'Paste API key provided by cloud service'} value={apiKey} onChange={(event) => handleChange('apiKey', event.target.value)}/>
				</Field>
			</>
		}

		{model && indexOf(['gpt-4', 'gpt-40', 'gpt-turbo', 'l3'], model) == -1  && 
			<>
				<Field className='flex-row gap-4 items-center '>
					<span className='w-1/2 flex-grow flex flex-row items-center gap-2'>
						Temperature
						<Tooltip content="Increasing the temperature will make the model answer more creatively. A value of 0.1 would be more factual">
							<InfoCircledIcon width="18" height="18" className='text-slatedarka-8 hover:text-slatedarka-10' />
						</Tooltip>
					</span>
					<TextField.Root className='flex-grow w-32' type='number' min={0.1} max={1} value={temp} onChange={(event) => handleChange('temp', event.target.value)} />
				</Field>
				<Field className='flex-row gap-4 items-center '>
					<span className='w-1/2 flex-grow'>Max new tokens</span>
					<TextField.Root className='flex-grow w-32' type='number' min={1024} value={maxNewTokens} onChange={(event) => handleChange('maxNewTokens', event.target.value)} />
				</Field>
				<Field className='flex-row gap-4 items-center '>
					<span className='w-1/2 flex-grow'>Context window</span>
					<TextField.Root className='flex-grow w-32' type='number' min={1024} value={contextWindow} onChange={(event) => handleChange('contextWindow', event.target.value)} />
				</Field>
			</>
		}
	</Card>
})


/*
	=======================================================================
	System Prompt
	=======================================================================
*/

export interface ISystemPromptForm {
	value: string
	onFormChange: (props: any) => void
	className?: string
}

export const SystemPromptForm = React.forwardRef<HTMLDivElement, ISystemPromptForm>( (
	props, forwardRef
) => {
	const {
		value, onFormChange, className, ...intrinsicProps
	} = props

	function handleChange(event) {
		console.log(event)
		props.onFormChange(
			{
				value: event.target.value
			}
		)
	}

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5 `} {...intrinsicProps}>
		<Field>
			<span>System prompt</span>
			<TextArea resize="vertical" rows={6} placeholder={`Compose system prompt to instruct LLM how to formulate the answer`} value={value} onChange={handleChange}/>
		</Field>
	</Card>
})

/*
	=======================================================================
	Prompt Template Editor
	=======================================================================
*/

export interface IPromptTemplateForm {
	value: string
	variables: string[]
	hasContext?: boolean
	hasSystem?: boolean
	placeholder: string
	onFormChange: (props: any) => void
	className?: string
}

export const PromptTemplateForm = React.forwardRef<HTMLDivElement, IPromptTemplateForm>( (
	props, forwardRef
) => {
	const {
		value, placeholder, onFormChange, className, variables, hasContext, hasSystem, ...intrinsicProps
	} = props

	function handleChange(value) {
		props.onFormChange(
			{
				value: value
			}
		)
	}

	const options = {
		lineNumbers: false
	}

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5  gap-4 flex flex-col`} {...intrinsicProps}>
		<Field className='mb-4'>
			<Text size="2" className='mb-2'>Available variables</Text>
			<DataList.Root className='cursor-auto font-normal text-xs align-baseline'>
				
				<Canvas.Section canvasKey='var-user-prompt'>
					<DataList.Item>
						<DataList.Value className=' min-w-20'>
							<span className='variable-badge flex text-xs'>{`{{user}}`}</span>
						</DataList.Value>
						<DataList.Label>User prompt</DataList.Label>
					</DataList.Item>
				</Canvas.Section>

				{hasContext && 
				<Canvas.Section canvasKey='var-context-prompt'>
					<DataList.Item>
						<DataList.Value className=' min-w-20'>
							<span className='variable-badge flex text-xs'>{`{{context}}`}</span>
						</DataList.Value>
						<DataList.Label>Embedded context</DataList.Label>
					</DataList.Item>
				</Canvas.Section>}

				{hasSystem && <Canvas.Section canvasKey='var-system-prompt'>
					<DataList.Item>
						<DataList.Value className=' min-w-20'>
							<span className='variable-badge flex text-xs'>{`{{system}}`}</span>
						</DataList.Value>
						<DataList.Label>System prompt</DataList.Label>
					</DataList.Item>
				</Canvas.Section>}

					
			</DataList.Root>
		</Field>
		
		<Field>
			<span>Prompt template</span>
			<CodeMirror 
				value={value} onChange={handleChange}
				placeholder={placeholder}
				options={options}
				className='codemirror-theme font-mono text-xs'
			/>
		</Field>

		<Field>
			<Button size="2" variant="soft" className='cursor-pointer'>
				Generate automatically
			</Button>
		</Field>

	</Card>
})


/*
	=======================================================================
	Add Context
	=======================================================================
*/

export enum ContextType {
	url = 'url',
	dataset = 'dataset'
}

export interface IAddContextForm {
	value: ContextType
	url?: string
	dataset?: string
	datasetOptions?: {value: string, label: string, meta: string}[]
	embedding?: string
	embeddingOptions?: {value: string, label: string, meta: string}[]
	onFormChange: (props: any) => void
	className?: string
}

export const AddContextForm = React.forwardRef<HTMLDivElement, IAddContextForm>( 
	(props, forwardRef) => 
{
	const { value, datasetOptions, url, dataset, onFormChange, className, embedding, embeddingOptions, ...intrinsicProps} = props

	function handleChange(prop, value) {
		props.onFormChange(
			{
				[`${prop}`]: value
			}
		)
	}

	return (
		<Card ref={forwardRef} className={`${className || ''} py-5 px-5  gap-4 flex flex-col`} {...intrinsicProps}>
			<Field>
				Context type
				<RadioCards.Root columns="2" defaultValue={ContextType.url} value={value}>
					<RadioCards.Item value={ContextType.url} onClick={() => handleChange('value', ContextType.url)}>
						URL
					</RadioCards.Item>
					<RadioCards.Item value={ContextType.dataset} onClick={() => handleChange('value', ContextType.dataset)}>
						Dataset
					</RadioCards.Item>
				</RadioCards.Root>
			</Field>

			{value == ContextType.url && <>
				<Field>
					Request URL
					<TextArea className='url-input text-xs font-mono' resize="vertical" rows={3} placeholder={'You can use variables available below in URL'} value={props.url} onChange={(event) => handleChange('url', event.target.value)}/>
					<DataList.Root className='cursor-auto font-normal text-xs align-baseline'>
						<Canvas.Section canvasKey='var-user-prompt-context'>
						<DataList.Item>
							<DataList.Value className=' min-w-20'>
								<span className='variable-badge flex text-xs'>{`{{user}}`}</span>
							</DataList.Value>
							<DataList.Label>User prompt</DataList.Label>
						</DataList.Item>
						</Canvas.Section>
					</DataList.Root>
				</Field>
				</>}

			{value == ContextType.dataset && <>
				<Field>
					Choose dataset
					<Select.Root 
						value={dataset} 
						onValueChange={(value) => handleChange('dataset', value)}
					>
							<Select.Trigger aria-label="LLM Model" placeholder="Select a model" />
							<Select.Content role="dialog"
								aria-label="Languages"
								position="popper"
								sideOffset={4}
								className='popover-max-height'
							>
								{datasetOptions ? ( 
									datasetOptions.map((opt) => (
										<Select.Item value={opt.value} className=''>{opt.label}</Select.Item>
									))
								) : (
									<div className="no-results">No results found</div>
								)}
							</Select.Content>
					</Select.Root>
				</Field>

				<Field>
					Embeddings model
					<Select.Root 
						value={embedding} 
						onValueChange={(value) => handleChange('embedding', value)}
					>
							<Select.Trigger aria-label="LLM Model" placeholder="Select a model" />
							<Select.Content role="dialog"
								aria-label="Languages"
								position="popper"
								sideOffset={4}
								className='popover-max-height'
							>
								{embeddingOptions ? ( 
									embeddingOptions.map((opt) => (
										<Select.Item value={opt.value} className=''>{opt.label}</Select.Item>
									))
								) : (
									<div className="no-results">No results found</div>
								)}
							</Select.Content>
					</Select.Root>
				</Field>
			
			</>}
		</Card>
	)
})


/*
	=======================================================================
	User Prompt
	=======================================================================
*/

export interface IUserPromptForm {
	value: string
	onFormChange: (props: any) => void
	className?: string
}

export const UserPromptForm = React.forwardRef<HTMLDivElement, IUserPromptForm>( (
	props, forwardRef
) => {
	const {
		value, onFormChange, className, ...intrinsicProps
	} = props

	function handleChange(event) {
		console.log(event)
		props.onFormChange(
			{
				value: event.target.value
			}
		)
	}

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5 `} {...intrinsicProps}>
		<Field>
			<span>User prompt</span>
			<TextArea resize="vertical" rows={6} placeholder={`Compose user prompt or leave blank for live chat`} value={props.value} onChange={handleChange}/>
		</Field>
	</Card>
})

/*
	=======================================================================
	User Prompt
	=======================================================================
*/

export interface IPlaceholderCard {
	value: string
	onAddCard: (value: any) => void
	className?: string
	children?: React.ReactNode
}

export const PlaceholderCard = React.forwardRef<HTMLDivElement, IPlaceholderCard>( (
	props, forwardRef
) => {
	const {
		value, onAddCard, className, children, ...intrinsicProps
	} = props

	function handleAdd() {
		props.onAddCard(
			{
				value: value
			}
		)
	}

	return <div ref={forwardRef} className={`${props.className || ''}`} {...intrinsicProps}>
		{children}
	</div>
})

PlaceholderCard.displayName = 'PlaceholderCard'