import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import Drevo from './OdlocitvenoDrevo.jsx'
import Navbar from './Navbar.jsx'

import './index.css'

function App() {

  return (
    <div className="App" >  
      <Router>
        <Navbar />
        <Routes>
          <Route path="/drevo" element={<Drevo />} />
        </Routes>
         
      </Router>
    </div>
   
  )
}

export default App
