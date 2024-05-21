import * as React from 'react'

interface ILayoutProps extends React.HTMLProps<HTMLElement> {
	children?: React.ReactNode
}

const Layout = React.forwardRef<HTMLDivElement, ILayoutProps> ((props, ref) => {
	return (
		<div ref={ref} data-canvas-section={`main`}
			className={`${props.className || ''}`}
		>
			{props.children}
		</div>
	)
});

export default Layout;