import React, { Component } from 'react';
import Authentication from '../../util/Authentication/Authentication'

import './App.css';

class App extends Component {
  state = {
    response: "",
    post: "",
    responseToPost: "",
    textToDisplay: ""
  }

  constructor(props){
      super(props)
      this.Authentication = new Authentication()

      //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null.
      this.twitch = window.Twitch ? window.Twitch.ext : null
      console.log(this.twitch);
      this.state={
          finishedLoading:false,
          theme:'light',
          isVisible:true
      }
  }

  contextUpdate(context, delta){
      if(delta.includes('theme')){
          this.setState(()=>{
              return {theme:context.theme}
          })
      }
  }

  visibilityChanged(isVisible){
      this.setState(()=>{
          return {
              isVisible
          }
      })
  }

  componentDidMount(){
      if(this.twitch){
          this.twitch.onAuthorized((auth)=>{
              this.Authentication.setToken(auth.token, auth.userId)
              if(!this.state.finishedLoading){
                  // if the component hasn't finished loading (as in we've not set up after getting a token), let's set it up now.

                  // now we've done the setup for the component, let's set the state to true to force a rerender with the correct data.
                  this.setState(()=>{
                      return {finishedLoading:true}
                  })
              }
          })

          this.twitch.listen('broadcast',(target,contentType,body)=>{
              this.twitch.rig.log(`New PubSub message!\n${target}\n${contentType}\n${body}`)
              // now that you've got a listener, do something with the result...

              // do something...

          })

          this.twitch.onVisibilityChanged((isVisible,_c)=>{
              this.visibilityChanged(isVisible)
          })

          this.twitch.onContext((context,delta)=>{
              this.contextUpdate(context,delta)
          })
      }

      this.callApi()
        .then(console.log("Done"))
        .catch(err => console.log(err));
  }

  callApi = async () => {
    console.log("this is happening");
    const response = await fetch("/api/getScream", {
      method: "GET",
      headers: {
      }
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    this.setState(body);
    return body;
  }

  componentWillUnmount(){
      if(this.twitch){
          this.twitch.unlisten('broadcast', ()=>console.log('successfully unlistened'))
      }
  }

  handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch ("/api/postScream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    this.setState(body);
  }

  render() {
      if (this.state.finishedLoading && this.state.isVisible) {
          return (
              <div className="App">
                  <div className={this.state.theme === 'light' ? 'App-light' : 'App-dark'} >
                      <p>Hello world!</p>
                      <p>My token is: {this.Authentication.state.token}</p>
                      <p>My opaque ID is {this.Authentication.getOpaqueId()}.</p>
                      <div>{this.Authentication.isModerator() ? <p>I am currently a mod, and here's a special mod button <input value='mod button' type='button'/></p>  : 'I am currently not a mod.'}</div>
                      <p>I have {this.Authentication.hasSharedId() ? `shared my ID, and my user_id is ${this.Authentication.getUserId()}` : 'not shared my ID'}.</p>
                      <p>{this.state.textToDisplay}</p>
                      <form onSubmit={this.handleSubmit}>
                        <button type="submit">Scream</button>
                      </form>
                  </div>
              </div>
          )
      } else {
          return (
              <div className="App">
                <p>Not authorized</p>
                <p>{this.state.textToDisplay}</p>
                <form onSubmit={this.handleSubmit}>
                  <button type="submit">Scream</button>
                </form>
              </div>
          )
      }
  }
}

export default App;
