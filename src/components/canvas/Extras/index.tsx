import * as React from 'react'

interface IExtrasProps extends React.HTMLProps<HTMLElement> {
	children?: React.ReactNode
}

const Extras = React.forwardRef<HTMLDivElement, IExtrasProps> ((props, ref) => {
	return (
		<div ref={ref} data-canvas-section={`extras`}
			className={`${props.className || ''} absolute top-0 left-0`}
		>
			{props.children}
		</div>
	)
});

export default Extras;