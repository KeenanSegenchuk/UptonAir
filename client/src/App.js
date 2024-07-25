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
      {/*This fetches members from the backend and presents them on the frontend*/ }
      {(typeof data.members === 'undefined')?(
        <p>Loading..</p>
      ):(
        data.members.map((member,i) =>(
          <p key = {i}>{member}</p>
        ))
      )}
      </div>
  )
}

export default App