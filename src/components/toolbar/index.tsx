import * as React from 'react'

interface IToolbarProps extends React.HTMLProps<HTMLElement> {
}

const Toolbar: React.FunctionComponent<IToolbarProps> = (props) => {
	return <div className={`${props.className || ''}`}>{props.children}</div>
};

export default Toolbar;