import { useState } from 'react';
import './App.css';
const uuid = require('uuid');

function App() {

  const [image, setImage] = useState('');
  const [uploadResultMessage, setuploadResultMessage] = useState('Please upload an image');
  const [visitorName, setVisitorName] = useState('holder.jpg');
  const [isAuth, setAuth] = useState(false);

  function sendImage(e){
    e.preventDefault();
    setVisitorName(image.name);
    const visitorImageName = uuid.v4();
    fetch(`https://84jj24znrk.execute-api.ca-central-1.amazonaws.com/dev/input-pic-bucket/${visitorImageName}.jpeg`,
    {
      method: 'PUT',
      headers:{
        'Content-Type': 'image/jpeg'
      },
      body:image
    }).then(async () => {
      const response = await authenticate(visitorImageName);
      if (response.Message === 'Success'){
        setAuth(true);
        setuploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, welcome`)
      } 
      else{
        setAuth(false);
        setuploadResultMessage('Authentication failed')
      }
    }).catch(error => {
      setAuth(false);
      setuploadResultMessage('Auth error')
      console.error(error);
    })
  }

  async function authenticate(visitorImageName){
    const requestUrl = 'https://84jj24znrk.execute-api.ca-central-1.amazonaws.com/dev/employee?' + URLSearchParams({
      objectKey: `${visitorImageName}.jpeg`
    });
    return await fetch(requestUrl, {
      method: 'GET',
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(response => response.json())
    .then((data) => {
      return data;
    }).catch(error => console.error(error))
  }
  
  return (
    <div className="App">
      <h2> Rekog App</h2>
      <form onSubmit={sendImage}>
        <input type='file' name='image' onChange={e => setImage(e.target.files[0])} />
        <button type='submit'> Authenticate </button>
      </form>
      <div className={isAuth ? 'success' : 'failure'}> {uploadResultMessage} </div>
      <img src={require(`./visitors/${visitorName}`)} alt="Visitor" height={250} width={250}/>
    </div>
  );
}

export default App;
