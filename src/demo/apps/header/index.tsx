import * as React from 'react'

interface IHeaderProps extends React.HTMLProps<HTMLElement> {
}

const Header: React.FunctionComponent<IHeaderProps> = (props) => {
	return <div className={`${props.className || ''} w-full h-full bg-slate-50 min-h-5 border-b border-b-slate-200`}>&nbsp;</div>
};

export default Header;
