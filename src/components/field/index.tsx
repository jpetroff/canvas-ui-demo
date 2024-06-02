import * as React from 'react'
import { Text } from '@radix-ui/themes'

export interface IFieldProps {
	children?: React.ReactNode
	className?: string
}

const Field : React.FC<IFieldProps> = (
	props
) => {
	return <Text as="label" size="2" className={`font-semibold text-slatedark-12 flex flex-col gap-2 ${props.className || ''}`}>
		{props.children}
	</Text>
}

export default Field