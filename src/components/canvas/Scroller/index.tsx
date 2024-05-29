import * as React from 'react'
import './scroller.css'

interface IScrollerProps extends React.HTMLProps<HTMLElement> {
}

const Scroller: React.FunctionComponent<IScrollerProps> = (props) => {
	return <div data-canvas-scroller className={`${props.className || ''} w-full h-full overflow-auto`}>{props.children}</div>
};

export default Scroller