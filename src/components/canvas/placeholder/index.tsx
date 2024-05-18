import * as React from 'react'
import { extend } from 'lodash'

interface IPlaceholderProps extends React.HTMLProps<HTMLElement> {
	top?: number
	left?: number
	w?: number
	h?: number
}

const Placeholder: React.FunctionComponent<IPlaceholderProps> = (props) => {
	const styleObject = extend(props.style, {
		top: props.top ? props.top+'px' : null,
		left: props.left ? props.left+'px' : null,
		width: props.w ? props.w+'px' : null,
		height: props.h ? props.h+'px' : null,
		zIndex: 999999
	})

	return <div 
		className={`${props.className || ''} bg-blue-100 ring-2 ring-blue-800 opacity-20 absolute`}
		style={styleObject}
	>&nbsp;</div>
};

export default Placeholder;