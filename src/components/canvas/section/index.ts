import * as React from 'react'

interface ISectionProps extends React.HTMLProps<HTMLElement> {
	canvasKey: string
	children?: React.ReactElement
}

const Section: React.FunctionComponent<ISectionProps> = (props) => {
	const { children, canvasKey, ...elementProps} = props

	return React.cloneElement(
		children,
		{ 
			['data-key']: canvasKey, 
			['data-canvas-container-section']: true,
			key: canvasKey, 
			...elementProps, 
			...children.props
		}
	)
}

export default Section