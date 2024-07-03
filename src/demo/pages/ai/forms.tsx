import { Card, TextArea, Text, TextField, Select, RadioCards, Box, DataList, Flex, Tooltip, IconButton, Button, Checkbox, Switch, CardProps, Separator } from '@radix-ui/themes'
import { QuestionMarkIcon, InfoCircledIcon, PlayIcon, Cross2Icon } from '@radix-ui/react-icons'
import * as React from 'react'
import Field from '@components/field'
import CodeMirror from '@uiw/react-codemirror'
import { xcodeDark } from '@uiw/codemirror-theme-xcode'
import { defer, indexOf } from 'lodash'
import Canvas from '@components/canvas'


/*
	=======================================================================
	Onboarding Form
	=======================================================================
*/

export interface IOnboardingForm extends CardProps {
	model: boolean,
	prompt: boolean,
	validator: boolean,
	context: boolean,
	onFormChange: (props: any) => void
}

export const OnboardingForm = React.forwardRef<HTMLDivElement, IOnboardingForm>(
(
	props, forwardRef
) => {
	const {
		model,	prompt,	validator, context, className, onFormChange, ...intrinsic
	} = props

	function handleChange(prop, value) {
		onFormChange(
			{
				[prop]: value
			}
		)
	}

	return (
		<Card ref={forwardRef} className={`py-5 px-5 ${className || ''}`} {...intrinsic}>
			<Flex direction='row' className='mb-5'>
				<Text size="3">Follow this guide to create your first AI bot</Text>
			</Flex>

			<Tooltip content="Dismiss checklist">
				<IconButton variant='ghost' size='3' color='gray' className='m-0 absolute right-3 top-4 cursor-pointer'>
					<Cross2Icon />
				</IconButton>
			</Tooltip >

			<Flex direction="column" gap="2">

				<Text as="label" size="2" className={`${model ? 'line-through text-slatedark-8' : ''}`} >
					<Flex gap="2">
						<Checkbox checked={model}  onClick={() => handleChange('model', !model)} />
						Choose desired model
					</Flex>
				</Text>

				<Text as="label" size="2" className={`${prompt ? 'line-through text-slatedark-8' : ''}`}>
					<Flex gap="2">
						<Checkbox checked={prompt} onClick={() => handleChange('prompt', !prompt)} />
						Compose user prompt
					</Flex>
				</Text>

				<Text as="label" size="2">
					<Flex gap="2">
						<Checkbox checked={false} onClick={() => void 0} />
						Add testing validator for your model — parameter you want to optimize
					</Flex>
				</Text>

				<Text as="label" size="2" className={`${context ? 'line-through text-slatedark-8' : ''}`}>
					<Flex gap="2">
						<Checkbox checked={context} onClick={() => handleChange('context', !context)} />
						(Optional) Add context
					</Flex>
				</Text>

			</Flex>
		</Card>
	)
}
)

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
	autogenerate: boolean
}

export const PromptTemplateForm = React.forwardRef<HTMLDivElement, IPromptTemplateForm>( (
	props, forwardRef
) => {
	const {
		value, placeholder, onFormChange, className, variables, hasContext, hasSystem, autogenerate, ...intrinsicProps
	} = props

	function handleChange(value) {
		props.onFormChange(
			{
				value: value
			}
		)
	}

	function toggleAutogenerate() {
		props.onFormChange(
			{
				autogenerate: !autogenerate,
				value: value
			}
		)
	}

	const options = {
		foldGutter: false,
		dropCursor: false,
		allowMultipleSelections: false,
		indentOnInput: false,
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
		
		<Field nolabel>
			<div className='flex flex-col gap-2'>
				<div className='flex-grow'>Prompt template</div>
				<label className='flex gap-2 font-normal'>
					<Switch checked={autogenerate} onClick={() => toggleAutogenerate()} size="1" />  Generate automatically 
				</label>
			</div>
			<CodeMirror
				readOnly={autogenerate}
				value={value} onChange={handleChange}
				placeholder={placeholder}
				basicSetup={options}
				theme={xcodeDark}
				height='auto'
				minHeight='96px'
				className='codemirror-theme font-mono text-xs cursor-auto'
			/>
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

/*
	=======================================================================
	Finish
	=======================================================================
*/

export interface IFinalCard extends CardProps {
	result: 'test' | 'publish',
	className?: string,
	onFormChange: (props: any) => void
}

export const FinalCard = React.forwardRef<HTMLDivElement, IFinalCard>( (
	props, forwardRef
) => {
	const {
		result, className, ...intrinsicProps
	} = props

	function handleChange(prop, value) {
		props.onFormChange(
			{
				[prop]: value
			}
		)
	}

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5  gap-4 flex flex-col`} {...intrinsicProps}>
		<Field>
			<RadioCards.Root columns="2" defaultValue={ContextType.url} value={result}>
				<RadioCards.Item value={'test'} onClick={() => handleChange('result', 'test')}>
					Test
				</RadioCards.Item>
				<RadioCards.Item value={'publish'} onClick={() => handleChange('result', 'publish')}>
					Publish
				</RadioCards.Item>
			</RadioCards.Root>
		</Field>

		{result == 'test' && (<>
			<Field className='flex-grow'>
				To evaluate results add validators
				<Text size="1" className='font-normal text-slatedark-11'>Validators help you score LLM replies based on validation categories before publishing it live</Text>
				<Button className='flex flex-grow cursor-pointer' variant="soft" color="gray" size="2">Add validator</Button>
			</Field>
			<Separator className='w-auto -mx-5' size="4" />
			<Field className='flex-grow'>
				<Button className='flex flex-grow cursor-pointer' variant="solid" size="2">
					<PlayIcon />
					Run tests
				</Button>
			</Field></>
		)}
		{result == 'publish' && (<>
			<Field className='flex-grow items-center gap-4 my-2'>
				<svg width="120" height="120" viewBox="0 0 60 60" className='text-slatedark-10' fill="currentColor" xmlns="http://www.w3.org/2000/svg">
					<g clip-path="url(#clip0_733_57)">
					<path d="M28.94 0.03L29.06 2.03C29.68 1.99 30.32 1.99 30.94 2.03L31.06 0.03C30.36 -0.01 29.64 -0.01 28.94 0.03Z"/>
					<path d="M0.03 31.06L2.03 30.94C2.01 30.63 2 30.32 2 30C2 29.68 2 29.37 2.03 29.06L0.03 28.94C0.00999997 29.29 0 29.64 0 30C0 30.36 0.00999997 30.71 0.03 31.06Z"/>
					<path d="M2.15 32.9L0.16 33.11C0.24 33.9 0.34 34.58 0.46 35.18C2.61 47.61 12.41 57.4 24.81 59.55C25.43 59.67 26.11 59.77 26.9 59.85L27.11 57.86C26.39 57.79 25.76 57.69 25.18 57.58C13.58 55.57 4.44 46.43 2.43 34.81C2.32 34.25 2.23 33.63 2.15 32.9Z"/>
					<path d="M57.97 29.06C57.99 29.37 58 29.68 58 30C58 30.32 58 30.63 57.97 30.94L59.97 31.06C59.99 30.71 60 30.36 60 30C60 29.64 59.99 29.29 59.97 28.94L57.97 29.06Z"/>
					<path d="M57.85 27.1L59.84 26.89C59.76 26.1 59.66 25.42 59.54 24.82C57.39 12.39 47.59 2.6 35.19 0.45C34.57 0.33 33.89 0.23 33.1 0.15L32.89 2.14C33.61 2.21 34.24 2.31 34.82 2.42C46.42 4.43 55.56 13.57 57.57 25.19C57.68 25.75 57.77 26.37 57.85 27.1Z"/>
					<path d="M30 60C30.36 60 30.71 59.99 31.06 59.97L30.94 57.97C30.32 58.01 29.68 58.01 29.06 57.97L28.94 59.97C29.29 59.99 29.64 60 30 60Z"/>
					<path d="M5.02 29.18C3.85 29.59 3 30.69 3 32C3 33.65 4.35 35 6 35C7.65 35 9 33.65 9 32C9 30.71 8.17 29.61 7.02 29.19C7.45 16.88 17.59 7 30 7V5C16.49 5 5.46 15.77 5.02 29.18ZM6 33C5.45 33 5 32.55 5 32C5 31.45 5.45 31 6 31C6.55 31 7 31.45 7 32C7 32.55 6.55 33 6 33Z"/>
					<path d="M57 28C57 26.35 55.65 25 54 25C52.35 25 51 26.35 51 28C51 29.29 51.83 30.39 52.98 30.81C52.55 43.12 42.41 53 30 53V55C43.51 55 54.54 44.23 54.98 30.82C56.15 30.41 57 29.31 57 28ZM54 29C53.45 29 53 28.55 53 28C53 27.45 53.45 27 54 27C54.55 27 55 27.45 55 28C55 28.55 54.55 29 54 29Z"/>
					<path d="M28 53H26V55H28V53Z"/>
					<path d="M34 5H32V7H34V5Z"/>
					<path d="M11 30C11 40.48 19.52 49 30 49C40.48 49 49 40.48 49 30C49 19.52 40.48 11 30 11C19.52 11 11 19.52 11 30ZM29 13.05V17.05C26.17 17.27 23.59 18.39 21.55 20.14L18.72 17.31C21.49 14.85 25.06 13.28 28.99 13.05H29ZM17.31 18.72L20.14 21.55C18.39 23.59 17.27 26.16 17.05 29H13.05C13.28 25.07 14.85 21.5 17.31 18.73V18.72ZM13.05 30.99H17.05C17.27 33.82 18.39 36.4 20.14 38.44L17.31 41.27C14.85 38.5 13.28 34.93 13.05 31V30.99ZM29 46.94C25.07 46.71 21.5 45.14 18.73 42.68L21.56 39.85C23.6 41.6 26.17 42.72 29.01 42.94V46.94H29ZM19 29.99C19 23.92 23.93 18.99 30 18.99C36.07 18.99 41 23.92 41 29.99C41 36.06 36.07 40.99 30 40.99C23.93 40.99 19 36.06 19 29.99ZM31 46.94V42.94C33.83 42.72 36.41 41.6 38.45 39.85L41.28 42.68C38.51 45.14 34.94 46.71 31.01 46.94H31ZM42.69 41.27L39.86 38.44C41.61 36.4 42.73 33.83 42.95 30.99H46.95C46.72 34.92 45.15 38.49 42.69 41.26V41.27ZM46.95 29H42.95C42.73 26.17 41.61 23.59 39.86 21.55L42.69 18.72C45.15 21.49 46.72 25.06 46.95 28.99V29ZM31 13.05C34.93 13.28 38.5 14.85 41.27 17.31L38.44 20.14C36.4 18.39 33.83 17.27 30.99 17.05V13.05H31Z"/>
					<path d="M34.57 23.44L33.43 25.08C35.04 26.19 36 28.03 36 30C36 33.31 33.31 36 30 36C26.69 36 24 33.31 24 30C24 28.03 24.96 26.2 26.57 25.08L25.43 23.44C23.28 24.93 22 27.38 22 30C22 34.41 25.59 38 30 38C34.41 38 38 34.41 38 30C38 27.38 36.72 24.92 34.57 23.44Z"/>
					<path d="M31 22H29V28H31V22Z"/>
					</g>
					<defs>
					<clipPath id="clip0_733_57">
					<rect width="60" height="60" fill="white"/>
					</clipPath>
					</defs>
				</svg>

				Ready to publish?
			</Field>
			<Separator className='w-auto -mx-5' size="4" />
			<Field className='flex-grow'>
				<Button className='flex flex-grow cursor-pointer' variant="solid" size="2">
					<PlayIcon />
					Publish live!
				</Button>
			</Field></>
		)}
	</Card>
})

PlaceholderCard.displayName = 'PlaceholderCard'
