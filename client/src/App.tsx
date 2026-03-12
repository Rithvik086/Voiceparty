import { useState } from "react"
import { Route,BrowserRouter,Routes } from "react-router-dom"
// import Sender from "./components/Sender"
// import Receiver from "./components/Reciever"
import Client from "./components/Client"

function App() {


  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/sender" element={<Sender />} /> */}
        <Route path="/client" element={<Client />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
