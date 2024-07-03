import AddConnector from '@apps/add-connection'
import Field from '@components/field'
import { Badge, Button, Card, CardProps, DropdownMenu, Flex, IconButton, SegmentedControl, Select, Text, TextArea, TextField } from '@radix-ui/themes'
import { concat, find, isArray, omit } from 'lodash'
import * as React from 'react'
import { DATABASE_LIST, DATABASE_PROPS, fieldOp, fieldType } from './form-setup'
import { FlowIcon } from '@pages/chat/forms'
import { TrashIcon } from '@radix-ui/react-icons'
import Canvas from '@components/canvas'

export type IChangeEvent = {
	type: 'change' | 'add-step' | 'remove-step' | 'delete' | 'connect'
	value: {
		from?: string
		to?: string
		[key: string]: any
	}
}

interface IDefaultBlock extends CardProps {
	onFormChange?: (event: IChangeEvent)  => void
	connections: string[]
	availableConnections: {key: string, name: string}[]
}

export interface IStartBlock extends IDefaultBlock {
	scenario: string
}

export const StartBlock = React.forwardRef<HTMLDivElement, IStartBlock>(
	(
		{className, scenario, onFormChange, connections, availableConnections, ...intrinsicProps}, 
		forwardRef
	) => {

		const key = intrinsicProps['data-key']

		function handleChange(event) {
			onFormChange(
				{
					type: 'change',
					value: {
						scenario: event.target.value
					}
				}
			)
		}

		function handleAddFlow(from: string, value?: string) {
			onFormChange({
				type: 'add-step',
				value: {
					connections: [ ...connections, '___new-flow']
				}
			})
		}

		return <Card ref={forwardRef} className={`${className || ''} py-5 px-5 flex flex-col gap-3`} {...intrinsicProps}>
			<Flex direction={`row`}>
				<Text size="2">
					<Badge size="1" color="amber">#Employee#</Badge>&nbsp;requests&nbsp;<Badge color="amber" size="1">#Absense days#</Badge>
				</Text>
			</Flex>
			<Field>
				Scenario name
				<TextField.Root value={scenario} onChange={handleChange} />
			</Field>
			<AddConnector
				available={availableConnections} existing={connections}
				onAdd={(value) => handleAddFlow(value)}
				onRemove={(value) => void 0}
			></AddConnector>
		</Card>
	}
)

type TCheckBlockProps = {
	type: 'check'
	database: string
	property: string
	branches: {value: string, op: string, connection: string}[]
}

type TNotifyBlockProps = {
	type: 'notify'
	provider: 'api' | 'slack' | 'email'
	destination?: string
	recipient: 'Requesting employee' | 'Superior of requesting employee' | 'HR rep of requesting employee' | 'URL' | 'Channel or direct message'
	message: string
}

type TRequestBlockProps = {
	type: 'request'
	provider: 'api' | 'slack' | 'email'
	destination?: string
	recipient: 'Requesting employee' | 'Superior of requesting employee' | 'HR rep of requesting employee' | 'URL' | 'Channel or direct message'
	message: string
	branches: {value: string, op: string, connection: string}[]
}

export type TSpecializedProps = TCheckBlockProps | TNotifyBlockProps | TRequestBlockProps

export type TStepBlockProps = IDefaultBlock & TSpecializedProps

export function generateBlockname(props: TStepBlockProps) : string {
	if(props.type == 'check') {
		return `Check ${props.property ? props.property+' from ' : ''} ${props.database ? find(DATABASE_LIST, {value: props.database})?.label : '...'}`
	}

	if(props.type == 'notify') {
		return `Notify ${props.recipient || ''} ${props.provider ? 'on '+props.provider : ''}`
	}

	if(props.type == 'request') {
		return `Request ${props.recipient || ''} ${props.provider ? 'on '+props.provider : ''}`
	}
}

export const StepBlock = React.forwardRef<HTMLDivElement, TStepBlockProps>(
	(
		props, forwardRef
	) => {

		const instrinsic = omit(props, 
			'type', 'onFormChange', 'connections', 'availableConnections', 'className',
			'database', 'property', 'branches',
			'provider', 'destination', 'value'
		)

		function handleChange(prop: string, value: any) {
			props.onFormChange({
				type: 'change',
				value: {
					[prop]: value
				}
			})
		}

		function handleDelete() {
			props.onFormChange({
				type: 'delete',
				value: {}
			})
		}

		return <Card ref={forwardRef} className={`${props.className || ''} min-w-[24rem] gap-4 flex flex-col`} {...instrinsic}>

			<Flex direction="row" justify="between" align="center" className='gap-2'>
				<Badge>{generateBlockname(props)}</Badge>
				<IconButton variant='ghost' color='red' size='3' className='cursor-pointer m-0 box-border' 
					onClick={() => 	handleDelete()}
				>
					<TrashIcon />
				</IconButton>
			</Flex>

			<SegmentedControl.Root value={props.type} className='flex w-full'>
				<SegmentedControl.Item value="check" onClick={() => handleChange('type', 'check')} className='flex-grow'>
					Check
				</SegmentedControl.Item>
				<SegmentedControl.Item value="notify" onClick={() => handleChange('type', 'notify')} className='flex-grow'>
					Notify
				</SegmentedControl.Item>
				<SegmentedControl.Item value="request" onClick={() => handleChange('type', 'request')} className='flex-grow'>
					Request
				</SegmentedControl.Item>
			</SegmentedControl.Root>

			{props.type == 'check' && CheckBlock(props)}

			{props.type == 'notify' && NotifyBlock(props)}

			{props.type == 'request' && RequestBlock(props)}

		</Card>
	}
)

const CheckBlock = (props: IDefaultBlock & TCheckBlockProps, ref?) => {
	const { onFormChange, connections, availableConnections, database, property, branches, className, ...instrinsic} = props

	const key = instrinsic['data-key']

	function handleChange(prop: string, value: any) {
		if(prop != null) 
			props.onFormChange({
				type: 'change',
				value: {
					[prop]: value
				}
			})
		else 
		props.onFormChange({
			type: 'change',
			value: {
				...value
			}
		})
	}

	function addStep(from: string, to?: string) {
		props.onFormChange({
			type: to ? 'connect' : 'add-step',
			value: {
				from: from,
				to: to
			}
		})
	}

	const propertyType = fieldType(property)
	const opArray = fieldOp(propertyType)

	return <>
		<Field>
			Check information from
			<Select.Root
				value={database}
				onValueChange={(value) => handleChange(null, {database: value, property: ''})}
			>
				<Select.Trigger aria-label="LLM Model" placeholder="Select database" />
				<Select.Content role="dialog"
					aria-label="Languages"
					position="popper"
					sideOffset={4}
					className='popover-max-height'
				>
					{DATABASE_LIST.map( (item) => {
						return <Select.Item value={item.value}>{item.label}</Select.Item>
					})}
				</Select.Content>
			</Select.Root>
		</Field>

		{database && DATABASE_PROPS[database] && DATABASE_PROPS[database].length > 0 && 
			<Field>
				Property
				<Select.Root
					value={property}
					onValueChange={(value) => handleChange('property', value)}
				>
					<Select.Trigger aria-label="LLM Model" placeholder="Select property" />
					<Select.Content role="dialog"
						aria-label="Languages"
						position="popper"
						sideOffset={4}
						className='popover-max-height'
					>
						{DATABASE_PROPS[database].map( (item) => {
							return <Select.Item value={item}>{item}</Select.Item>
						})}
					</Select.Content>
				</Select.Root>
			</Field>
		}


		{property && branches && branches.length > 0 && 
			<Field nolabel>
				Go to next step when:
				{branches.map(
					(branch, index) => {
						const opClass = branch.op == 'not empty' ? 'flex-grow' : ''
						const sectionKey = `${key}~${index}`
						return (
							<Canvas.Section canvasKey={sectionKey} >
								<Flex direction='row' className='gap-1' >
									<Select.Root value={branch.op} onValueChange={(value) => { let newBranches = Array.from(branches); newBranches[index].op = value; handleChange('branches', newBranches) } }>
										<Select.Trigger className={`${opClass}`} />
										<Select.Content>{opArray.map( (op) => <Select.Item value={op}>{op}</Select.Item> )}</Select.Content>
									</Select.Root>

									{branch.op != 'not empty' && 
										<TextField.Root 
											className='flex-grow'
											value={branch.value} onChange={(event) => { let newBranches = Array.from(branches); newBranches[index].value = event.target.value; handleChange('branches', newBranches) } } 
										/>
									}

									{index > 0 && 
										<IconButton variant='ghost' size="3" color='gray' className='m-0'
											onClick={() => { let newBranches = Array.from(branches); newBranches.splice(index, 1); handleChange('branches', newBranches) } }
										>
											<TrashIcon />
										</IconButton>
									}

									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											<IconButton variant='ghost' size="3" color='gray' className='m-0'>
												{FlowIcon}
											</IconButton>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content className='min-w-48'>
											<DropdownMenu.Item onClick={() => addStep(sectionKey, null)}>New step</DropdownMenu.Item>
											{isArray(availableConnections) && availableConnections.length > 2 && <DropdownMenu.Separator></DropdownMenu.Separator>}
											{isArray(availableConnections) && availableConnections.map(
													(item, index) => {
														if(item.key == key || item.key == 'start-block') return void 0
														return <DropdownMenu.Item onClick={() => addStep(sectionKey, item.key)}>{item.name}</DropdownMenu.Item>
													}
												)
											}
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Flex>
							</Canvas.Section>
						)
					}
				)}
				<Button variant='outline' color='gray' size='2'
					onClick={() => { let newBranches = Array.from(branches); newBranches.push({op: 'not empty', value: '', connection: null}); handleChange('branches', newBranches) } }
				>
					Add condition
				</Button>
			</Field>
		}
	</>
}

const NotifyBlock = (props: IDefaultBlock & TNotifyBlockProps, ref?) => {
	const { onFormChange, connections, availableConnections, provider, destination, recipient, message, className, ...instrinsic} = props

	function handleChange(prop: string, value: any) {
		if(prop != null) 
			props.onFormChange({
				type: 'change',
				value: {
					[prop]: value
				}
			})
		else 
		props.onFormChange({
			type: 'change',
			value: {
				...value
			}
		})
	}

	let recipientOptions = ["Requesting employee", "Superior of requesting employee", "HR rep of requesting employee"]
	if(provider == 'slack') recipientOptions.push('Channel or direct message')
	if(provider == 'api') recipientOptions.push('URL')

	return (<>
		<Field>
			Send notification via
			<Select.Root value={provider} onValueChange={(value) => handleChange('provider', value) }>
				<Select.Trigger className={`flex-grow`} />
				<Select.Content>{['api', 'slack', 'email'].map( (op) => <Select.Item value={op}>{op}</Select.Item> )}</Select.Content>
			</Select.Root>
		</Field>
		<Field>
			To recipient
			<Select.Root value={recipient} onValueChange={(value) => handleChange('recipient', value) }>
				<Select.Trigger className={`flex-grow`} />
				<Select.Content>{recipientOptions.map( (op) => <Select.Item value={op}>{op}</Select.Item> )}</Select.Content>
			</Select.Root>
		</Field>
		{recipient == 'Channel or direct message' && 
			<Field>
				Channel or direct message
				<TextField.Root value={destination} onChange={(event) => handleChange('destination', event.target.value) } />
			</Field>
		}
		{recipient == 'URL' && 
			<Field>
				URL
				<TextField.Root value={destination} onChange={(event) => handleChange('destination', event.target.value) } />
			</Field>
		}
		<Field>
			Message
			<TextArea rows={4} value={message} onChange={(event) => handleChange('message', event.target.value) } />
		</Field>
		</>)
}

const RequestBlock = (props: IDefaultBlock & TRequestBlockProps, ref?) => {
	const { onFormChange, connections, availableConnections, provider, destination, recipient, message, branches, className, ...instrinsic} = props

	function handleChange(prop: string, value: any) {
		if(prop != null) 
			props.onFormChange({
				type: 'change',
				value: {
					[prop]: value
				}
			})
		else 
		props.onFormChange({
			type: 'change',
			value: {
				...value
			}
		})
	}

	function addStep(from: string, to?: string) {
		props.onFormChange({
			type: to ? 'connect' : 'add-step',
			value: {
				from: from,
				to: to
			}
		})
	}

	const opArray = fieldOp()
	const key = instrinsic['data-key']

	let recipientOptions = ["Requesting employee", "Superior of requesting employee", "HR rep of requesting employee"]
	if(provider == 'slack') recipientOptions.push('Channel or direct message')
	if(provider == 'api') recipientOptions.push('URL')

	return (<>
		<Field>
			Send notification via
			<Select.Root value={provider} onValueChange={(value) => handleChange('provider', value) }>
				<Select.Trigger className={`flex-grow`} />
				<Select.Content>{['api', 'slack', 'email'].map( (op) => <Select.Item value={op}>{op}</Select.Item> )}</Select.Content>
			</Select.Root>
		</Field>
		<Field>
			To recipient
			<Select.Root value={recipient} onValueChange={(value) => handleChange('recipient', value) }>
				<Select.Trigger className={`flex-grow`} />
				<Select.Content>{recipientOptions.map( (op) => <Select.Item value={op}>{op}</Select.Item> )}</Select.Content>
			</Select.Root>
		</Field>
		{recipient == 'Channel or direct message' && 
			<Field>
				Channel or direct message
				<TextField.Root value={destination} onChange={(event) => handleChange('destination', event.target.value) } />
			</Field>
		}
		{recipient == 'URL' && 
			<Field>
				URL
				<TextField.Root value={destination} onChange={(event) => handleChange('destination', event.target.value) } />
			</Field>
		}
		<Field>
			Message
			<TextArea rows={4} value={message} onChange={(event) => handleChange('message', event.target.value) } />
		</Field>

		{branches && branches.length > 0 && 
			<Field nolabel>
				Go to next step when response:
				{branches.map(
					(branch, index) => {
						const opClass = branch.op == 'not empty' ? 'flex-grow' : ''
						const sectionKey = `${key}~${index}`
						return (
							<Canvas.Section canvasKey={sectionKey} >
								<Flex direction='row' className='gap-1' >
									<Select.Root value={branch.op} onValueChange={(value) => { let newBranches = Array.from(branches); newBranches[index].op = value; handleChange('branches', newBranches) } }>
										<Select.Trigger className={`${opClass}`} />
										<Select.Content>{opArray.map( (op) => <Select.Item value={op}>{op}</Select.Item> )}</Select.Content>
									</Select.Root>

									{branch.op != 'not empty' && 
										<TextField.Root 
											className='flex-grow'
											value={branch.value} onChange={(event) => { let newBranches = Array.from(branches); newBranches[index].value = event.target.value; handleChange('branches', newBranches) } } 
										/>
									}

									{index > 0 && 
										<IconButton variant='ghost' size="3" color='gray' className='m-0'
											onClick={() => { let newBranches = Array.from(branches); newBranches.splice(index, 1); handleChange('branches', newBranches) } }
										>
											<TrashIcon />
										</IconButton>
									}

									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											<IconButton variant='ghost' size="3" color='gray' className='m-0'>
												{FlowIcon}
											</IconButton>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content className='min-w-48'>
											<DropdownMenu.Item onClick={() => addStep(sectionKey, null)}>New step</DropdownMenu.Item>
											{isArray(availableConnections) && availableConnections.length > 2 && <DropdownMenu.Separator></DropdownMenu.Separator>}
											{isArray(availableConnections) && availableConnections.map(
													(item, index) => {
														if(item.key == key || item.key == 'start-block') return void 0
														return <DropdownMenu.Item onClick={() => addStep(sectionKey, item.key)}>{item.name}</DropdownMenu.Item>
													}
												)
											}
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Flex>
							</Canvas.Section>
						)
					}
				)}
				<Button variant='outline' color='gray' size='2'
					onClick={() => { let newBranches = Array.from(branches); newBranches.push({op: 'not empty', value: '', connection: null}); handleChange('branches', newBranches) } }
				>
					Add condition
				</Button>
			</Field>
		}
		</>)
}