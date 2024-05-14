import * as React from 'react'

interface ISidebarProps extends React.HTMLProps<HTMLElement> {
}

const Sidebar: React.FunctionComponent<ISidebarProps> = (props) => {
	return <div className={`${props.className || ''} h-full w-full`}>&nbsp;</div>
};

export default Sidebar;