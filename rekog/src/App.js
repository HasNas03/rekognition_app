import defaultImageSource from './start.png';
import info from './info.png';
import { useState } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Rules from './Rules';
import './App.css';
const uuid = require('uuid');



function App() {

  const [image, setImage] = useState('');
  const [uploadResultMessage, setuploadResultMessage] = useState('Please upload an image to be authenticated');
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
      setuploadResultMessage('Auth error. Cannot detect a face');
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
  
  // New function to handle central S3 bucket upload
  function uploadToCentralS3(e) {
    e.preventDefault();
    const centralImageName = image.name;

    fetch(`https://04zc8qo7og.execute-api.us-east-1.amazonaws.com/dev/central-image-bucket/${centralImageName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg'
      },
      body: image
    })
      .then(() => {
        setuploadResultMessage('Image uploaded to central database successfully');
        console.log("uploaded");
      })
      .catch(error => {
        setuploadResultMessage('Error uploading image to database');
        console.error(error);
      });
  }
  // New input change handler to set the selected image for both functions
  function handleImageChange(e) {
    setImage(e.target.files[0]);
  }

  return (
    <div className="App">
      <div className="icon-container">
        <img src={info} alt="Icon" className="icon" />
        <p className='icon2'>Authenticate Image: <br/><br/>Upload an image from your computer to be facially authenticated. If it is in the database, 
          you will be authenticated!
        </p>

        <p className='icon2'>Upload to Database: <br/><br/>In order to successfully authenticate a face, an image of the same face must be present in the 
          database. This option allows you to upload a facial image directly to the database for future authentication!.
        </p>
      </div>
      <h2 className='title'> Rekog App</h2>
      <h4 style={{color: 'white'}}>Welcome, please read the info page before using the application. Happy authenticating!</h4>
      <form onSubmit={sendImage}>
        <input type='file' name='image' onChange={handleImageChange} />
        <button className='button' type='submit'> Authenticate Image </button>
      </form>
      
      {/* Button to upload image to 'central' S3 bucket */}
      <form onSubmit={uploadToCentralS3}>
        <input type='file' name='centralImage' onChange={handleImageChange} />
        <button className='button2' type='submit'> Upload to Database </button>
      </form>

      <div className={`message ${isAuth ? 'success' : 'failure'}`}> {uploadResultMessage} </div>
      <div className='images'>
      <img
        src={image ? URL.createObjectURL(image) : defaultImageSource}
        alt="Visitor Image"
        height={350}
        width={350}
        className='image'
      />
      </div>
    </div>
  );
}

export default App;
