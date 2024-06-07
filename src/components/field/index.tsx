import * as React from 'react'
import { Text, TextProps } from '@radix-ui/themes'
import { isString, omit } from 'lodash'

export interface IFieldProps {
	children?: React.ReactNode
	className?: string
	nolabel?: boolean
	onClick?: (event) => void
}

const Field : React.FC<IFieldProps> = (
	props
) => {
	const flex = isString(props.className) && props.className.match(/(flex\-col|flex\-row)/) != null ? '' : 'flex-col'
	const gap = isString(props.className) && props.className.match(/gap\-[0-9]?/) != null ? '' : 'gap-2'
	return <Text as={ props.nolabel ? 'div' : 'label'} size="2" className={`font-semibold text-slatedark-12 flex ${flex} ${gap} ${props.className || ''}`}
		{...omit(props, 'className', 'nolabel', 'children')}
	>
		{props.children}
	</Text>
}

export default Field