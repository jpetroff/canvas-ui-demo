import * as React from 'react'

interface ISidebarProps extends React.HTMLProps<HTMLElement> {
	children?: React.ReactElement
}

const Sidebar: React.FunctionComponent<ISidebarProps> = (props) => {
	return <div className={`${props.className || ''} p-4 h-full w-full`}>{props.children}</div>
};

export default Sidebar;