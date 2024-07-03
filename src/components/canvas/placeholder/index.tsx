import * as React from 'react'

interface IPlaceholderProps extends React.HTMLProps<HTMLDivElement> {
}

const Placeholder = React.forwardRef<HTMLDivElement, IPlaceholderProps> ((props, ref) => {
	const { className,  ...elementProps } = props
	return <div ref={ref} {...elementProps}
		className={`${props.className || ''} rounded-md bg-indigodark-5/30 ring-2 ring-indigodark-6/70 absolute hidden z-[9999999]`}
	>&nbsp;</div>
});

export default Placeholder;