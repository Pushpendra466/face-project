import React, { Component } from 'react';
import './App.css';
import Navigation from'./component/Navigation/Navigation';
import Logo from './component/Logo/Logo';
import Signin from './component/signIn/signIn';
//import Register from './component/Register/Register';
import ImageLinkForm from './component/ImageLinkForm/ImageLinkForm';
import Rank from './component/Rank/Rank';
import Particles from 'react-particles-js';
//import Clarifai from 'clarifai';
import FaceRecognition from './component/FaceRecognition/FaceRecognition';
import Register from './component/Register/Register';

// import { render } from '@testing-library/react';

const particlesOptions={
  
    particles: {
      number:{
        value:100,
        density:{
          enable:true,
          value_area:800
        }
      }
    }
  
}
const initialState={
  input:'',
  imageUrl:'',
  box:{},
  route:'signin',
  isSignedIn:false,
  user:{
    id:'',
      name:'',
      email:'',
      entries:0,
      joined:''
  }
}
class App extends Component {
  constructor(){
  super();
  this.state=initialState;
}
loadUser=(data)=>{
  this.setState({user:{
    id:data.id,
        name:data.name,
        email:data.email,
        entries:data.entries,
        joined:data.joined
  }})
}
// componentDidMount(){
//   fetch('http://localhost:3000').then(response=>response.json()).then(console.log);
// }
calculateFaceLocation=(data)=>{
  const clarifaiFace= data.outputs[0].data.regions[0].region_info.bounding_box;
  const image=document.getElementById('inputimage');
  const width=Number(image.width);
  const height=Number(image.height);
  return{
    leftCol:clarifaiFace.left_col*width,
    topRow:clarifaiFace.top_row*height,
    rightCol:width-(clarifaiFace.right_col*width),
    bottomRow:height-(clarifaiFace.bottom_row*height)
  }
}
displayFaceBox=(box)=>{
  this.setState({box:box});
}
onInputChange=(event)=>{
  //console.log(event.target.value);
this.setState({input:event.target.value});
}
onButtonSubmit=()=>{
  this.setState({imageUrl:this.state.input});
  fetch('https://damp-fjord-38116.herokuapp.com/imageurl',{
        method:'post',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          input:this.state.input
        })
      })
      .then(response=>response.json())
  .then(response=>{
    if(response)
    {
      fetch('https://damp-fjord-38116.herokuapp.com/image',{
        method:'put',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          id:this.state.user.id
        })
      })
      .then(response=>response.json())
      .then(count=>{
        this.setState(Object.assign(this.state.user,{
          entries:count
        })
          
        )
      })
    }
    this.displayFaceBox( 
      this.calculateFaceLocation(response))})
      // console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
    .catch(err=>console.log(err));
}
onRouteChange=(route)=>{
  if(route==='signout'){
  this.setState(initialState);}
  else if(route==='home'){
    this.setState({isSignedIn:true});
  }
  this.setState({route:route});
}
  render(){
    const {isSignedIn,route,imageUrl,box}=this.state
  return (
    <div className="App">
     <Particles className='particles'
              params={particlesOptions}
            />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
      {route==='home'?
      <div><Logo/>
      <Rank name={this.state.user.name} entries={this.state.user.entries}/>
      <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
      <FaceRecognition box={box} imageUrl={imageUrl}/> </div>
      
      :(route==='signin'?
        <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
      )
      }
    </div>
  );}
}

export default App;
