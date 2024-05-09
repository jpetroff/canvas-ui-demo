import * as React from 'react'
import _ from 'lodash'

export type AppContextT = {
  requestUpdate: () => void
}

export type AppContextState = Omit<AppContextT, 'requestUpdate'>

const AppContext = React.createContext<AppContextT>( {
  requestUpdate: () => {}
} )

type Props = {
  initValue: Omit<AppContextT, 'requestUpdate'>
}

const AppContextProvider : React.FC<React.PropsWithChildren<Props>> = (
 {
  initValue,
  children
 } : React.PropsWithChildren<Props>
) => {
  const [ contextState, setContextState ] = React.useState(initValue)

  async function requestUpdate() {
    const contextState = await getInitAppContext()
    setContextState(contextState)
  }

  function resizeHandler() {
    const newContext = _.extend({ screenSize: [window.innerWidth, window.innerHeight] }, contextState)
    setContextState(newContext)
  }

  React.useEffect( () => {
    window.addEventListener('onresize', resizeHandler)

    return () => window.removeEventListener('onresize', resizeHandler)
  } )

  const value : AppContextT = React.useMemo( () => {
    return {
      ...contextState,
      requestUpdate
    }
  }, [contextState])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
} 

export default AppContext
export { AppContextProvider }

export async function getInitAppContext(): Promise<AppContextState> {
  return {}
}