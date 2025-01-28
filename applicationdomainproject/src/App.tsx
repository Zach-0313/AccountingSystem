import { useState } from 'react'
import LoginScreen from './LoginScreen.tsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <LoginScreen />
          </div>
      <p className="subtle-text">
        Application Domain Projects
      </p>
    </>
  )
}

export default App
