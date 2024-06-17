import { TrashIcon } from '@radix-ui/react-icons'
import { Button, Flex, FlexProps, IconButton, Text } from '@radix-ui/themes'
import { find, isFunction } from 'lodash'
import * as React from 'react'

export type TAddConnectProps = FlexProps & {
	available: {name: string, key: string}[]
	existing: string[]
	onAdd: (value?: string) => void
	onRemove: (value: string) => void
	onClickItem?: (value: string) => void
}

const AddConnector = React.forwardRef<HTMLDivElement, TAddConnectProps>(
	(
		{className, available, existing, onAdd, onRemove, onClickItem, ...intrinsic}, forwardRef
	) => {
		return <Flex className={`${className || ''} w-full min-w-[24em]`} {...intrinsic}>
			{existing.map(
				(item) => {
					return <Flex direction="row" key={item} align='center'>
						<Text className='flex flex-grow' as="div" onClick={() => { isFunction(onClickItem) && onClickItem(item) } } >
							{find(available, {key: item})?.name || item}
						</Text>
						<IconButton color='red' variant='ghost' className='m-0' onClick={() => onRemove(item)}>
							<TrashIcon />
						</IconButton>
					</Flex>
				}
			)}

			<Flex justify="center" flexGrow="1" >
				<Button onClick={() => onAdd()} variant="outline" className='cursor-pointer'>
					Add next step
				</Button>
			</Flex>
		</Flex>
	}
)

export default AddConnector