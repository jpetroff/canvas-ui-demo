import * as React from 'react'

interface IHeaderProps extends React.HTMLProps<HTMLElement> {
}

const Header: React.FunctionComponent<IHeaderProps> = (props) => {
	return <div className={`${props.className || ''} w-full h-full`}>&nbsp;</div>
};

export default Header;
