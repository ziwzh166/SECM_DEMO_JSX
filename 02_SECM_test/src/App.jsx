import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import Navbar from './components/Navbar'
import {Home, Images,Catalysis, Echem, SECM_Image} from './pages'





const App = () => {
  return (
        <main className='bg-slate-300/20'>
           <Router>
            <Navbar />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/images' element={<Images />} />
                <Route path='/catalysis' element={<Catalysis />} />
                <Route path='/echem' element={<Echem />} />
                <Route path='/secm_image' element={<SECM_Image />} />

        </Routes>
        </Router>   
        {/* <div>Contact</div> */}
        
        
        </main>

  )
}

export default App