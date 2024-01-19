import defaultImageSource from './start.png';
import { useState } from 'react';
import './App.css';
const uuid = require('uuid');

function App() {

  const [image, setImage] = useState('');
  const [uploadResultMessage, setuploadResultMessage] = useState('Upload an authentication image');
  const [isAuth, setAuth] = useState('false');

  function sendImage(e){
    e.preventDefault();
    const visitorImageName = uuid.v4();
    fetch(`https://04zc8qo7og.execute-api.us-east-1.amazonaws.com/dev/input-pic-bucket/${visitorImageName}.jpeg`,
    {
      method: 'PUT',
      headers:{
        'Content-Type': 'image/jpeg'
      },
      body:image
    }).then(async () => {
      const response = await authenticate(visitorImageName);
      // if face matched
      if (response.Message === 'Success'){
        setAuth(true);
        setuploadResultMessage(`Facial Authenticaion successful, welcome ${response['firstName']} ${response['lastName']}`)
      } 
      // if face not matched
      else{
        setAuth(false);
        setuploadResultMessage('Facial Authentication failed')
      }
    }).catch(error => {
      setAuth(false);
      setuploadResultMessage('Auth error');
      console.error(error);
    })
  }

  async function authenticate(visitorImageName) {
    const params = new URLSearchParams({
      objectKey: `${visitorImageName}.jpeg`
    });
  
    const requestUrl = `https://04zc8qo7og.execute-api.us-east-1.amazonaws.com/dev/employee?${params.toString()}`;
  
    return await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then(response => response.json())
    .then((data) => {
      return data;
    }).catch(error => console.error(error));
  }
  
  return (
    <div className="App">
      <h2> Rekog App</h2>
      <form onSubmit={sendImage}>
        <input type='file' name='image' onChange={e => setImage(e.target.files[0])} />
        <button className='button' type='submit'> Authenticate </button>
      </form>
      <div className={isAuth ? 'success' : 'failure'}> {uploadResultMessage} </div>
      <img
        src={image ? URL.createObjectURL(image) : defaultImageSource}
        alt="Visitor Image"
        height={350}
        width={350}
        className='image'
      />
      {/*<img src={visitorName} alt="Visitor" height={350} width={350} className='image'/>*/}
    </div>
  );
}

export default App;
