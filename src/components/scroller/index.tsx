import * as React from 'react'
import './scroller.css'

interface IScrollerProps extends React.HTMLProps<HTMLElement> {
}

const Scroller: React.FunctionComponent<IScrollerProps> = (props) => {
	return <div className={`${props.className || ''}`}>{props.children}</div>
};

export default Scroller;