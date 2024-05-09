import * as React from 'react'

interface ISidebarProps extends React.HTMLProps<HTMLElement> {
}

const Sidebar: React.FunctionComponent<ISidebarProps> = (props) => {
	return <div className={`${props.className || ''} h-full w-full border-r-slate-200 bg-slate-50 border-r`}>&nbsp;</div>
};

export default Sidebar;