import React, {useState, useEffect} from 'react'

function App() {
  const [data,setData] = useState([{}])

  //fetches the API
  useEffect(()=>{
    fetch("/members").then(
      res=>res.json()
    ).then(
      data=>{
        setData(data)
        //see if we retrieved from backend

        console.log(data)
      }
    )
  },[])
  return (
    <div>
      
      </div>
  )
}

export default App