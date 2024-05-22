import * as React from 'react'
import { useCanvasContext } from '../libs/context';

interface IExtrasProps extends React.HTMLProps<HTMLElement> {
	children?: React.ReactNode
}

const Extras = React.forwardRef<HTMLDivElement, IExtrasProps> ((props, ref) => {
	const globalContext = useCanvasContext()

	return (
		<div ref={ref} data-canvas-section={`extras`}
			className={`${props.className || ''} absolute`}
			style={
				{
					top: globalContext.area.padding.top,
					left: globalContext.area.padding.left,
				}
			}
		>
			{props.children}
		</div>
	)
});

export default Extras;