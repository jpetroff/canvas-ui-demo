import * as React from 'react'

interface IPlaceholderProps extends React.HTMLProps<HTMLDivElement> {
}

const Placeholder = React.forwardRef<HTMLDivElement, IPlaceholderProps> ((props, ref) => {
	const { className,  ...elementProps } = props
	return <div ref={ref} {...elementProps}
		className={`${props.className || ''} bg-blue-100 ring-2 ring-blue-800 opacity-20 absolute hidden z-[9999999]`}
	>&nbsp;</div>
});

export default Placeholder;