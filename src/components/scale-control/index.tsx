import * as React from 'react'
import { IconButton, Text } from '@radix-ui/themes'
import { PlusIcon, MinusIcon } from '@radix-ui/react-icons'

interface IScaler extends React.HTMLProps<HTMLDivElement> {
	currentScale: number
	onScaleChange: (scale: number) => void
	min: number
	max: number
	step: number
}

const Scaler: React.FunctionComponent<IScaler> = (props) => {

	return <div className={`${props.className || ''} flex flex-row items-center`}>
		<Text size="1" as="div">
			{Math.round(props.currentScale * 100)}%
		</Text>
		<IconButton size="1" color="gray" variant="ghost" disabled={props.currentScale <= props.min} 
			onClick={() => props.onScaleChange(
				(props.currentScale * 100 - props.step * 100) / 100
			)}
		>
			<MinusIcon />
		</IconButton>
		<IconButton size="1" color="gray" variant="ghost" disabled={props.currentScale >= props.max}
			onClick={() => props.onScaleChange(
				(props.currentScale * 100 + props.step * 100) / 100
			)}
		>
			<PlusIcon />
		</IconButton>
	</div>
}

export default Scaler