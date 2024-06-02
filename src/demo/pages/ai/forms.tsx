import { Card, TextArea, Text, TextField, Select, RadioCards, Box, DataList } from '@radix-ui/themes'
import * as React from 'react'
import Field from '@components/field'
import CodeMirror from 'react-codemirror'

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

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5 w-[20rem]`} {...intrinsicProps}>
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
	placeholder: string
	onFormChange: (props: any) => void
	className?: string
}

export const ModelForm = React.forwardRef<HTMLDivElement, IModelForm>( (
	props, forwardRef
) => {
	const {
		model, placeholder, onFormChange, className, options, ...intrinsicProps
	} = props

	function handleModelChange(value) {
		console.log(value)
		props.onFormChange(
			{
				model: value
			}
		)
	}

	console.log(props)

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5 w-[20rem]`} {...intrinsicProps}>
		<Field>
			<span>LLM model</span>
			<Select.Root 
				value={props.model} 
				onValueChange={handleModelChange}
			>
					<Select.Trigger aria-label="LLM Model" placeholder="Choose model you want to try" />
					<Select.Content role="dialog"
          	aria-label="Languages"
          	position="popper"
						sideOffset={4}
						className='popover-max-height'
					>
						{options.length ? ( 
							options.map((opt) => (
								<Select.Item value={opt.value} className=''>{opt.label}</Select.Item>
							))
						) : (
							<div className="no-results">No results found</div>
						)}
					</Select.Content>
			</Select.Root>
		</Field>
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

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5 w-[20rem]`} {...intrinsicProps}>
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
	placeholder: string
	onFormChange: (props: any) => void
	className?: string
}

export const PromptTemplateForm = React.forwardRef<HTMLDivElement, IPromptTemplateForm>( (
	props, forwardRef
) => {
	const {
		value, placeholder, onFormChange, className, variables, ...intrinsicProps
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

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5 w-[20rem]`} {...intrinsicProps}>
		<Field>
			<span>Prompt template</span>
			<CodeMirror 
				value={props.value} onChange={handleChange}
				placeholder={placeholder}
				options={options}
				className='codemirror-theme font-mono text-xs'
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
		<Card ref={forwardRef} className={`${className || ''} py-5 px-5 w-[20rem] gap-4 flex flex-col`} {...intrinsicProps}>
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
						<DataList.Item>
							<DataList.Value className=' min-w-20'>
								<span className='variable-badge flex text-xs'>{`{{user}}`}</span>
							</DataList.Value>
							<DataList.Label>User prompt</DataList.Label>
						</DataList.Item>
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

	return <Card ref={forwardRef} className={`${props.className || ''} py-5 px-5 w-[20rem]`} {...intrinsicProps}>
		<Field>
			<span>User prompt</span>
			<TextArea resize="vertical" rows={6} placeholder={`Compose user prompt or leave blank for live chat`} value={props.value} onChange={handleChange}/>
		</Field>
	</Card>
})