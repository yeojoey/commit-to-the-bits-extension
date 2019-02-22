import React, { Component } from 'react';
import Authentication from '../../util/Authentication/Authentication'
import Config from '../Config/Config'
import Voting from '../Voting/Voting'

import './App.css';

// DEBUG
const testState =  {
    isVoting: false,
    options: ["batman", "superman", "wonder woman", "aquaman"],
    finalWord: "No suggestions yet."
}

class App extends Component {
  state = {
    response: "",
    post: "",
    responseToPost: "",
    textToDisplay: "",
    characterSuggestion: "",
    botState: ""
  }


  constructor(props){
      super(props)
      this.Authentication = new Authentication()

      //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null.
      this.twitch = window.Twitch ? window.Twitch.ext : null
      this.state={
          finishedLoading:false,
          theme:'light',
          isVisible:true,
          botState: testState
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

              this.callApi()
                .then()
                .catch(err => console.log(err));

          })

          this.twitch.listen("broadcast", (target, contentType, message) => {
            this.setState({ textToDisplay: message});
          })

          // this.twitch.listen('broadcast',(target,contentType,body)=>{
          //     this.twitch.rig.log(`New PubSub message!\n${target}\n${contentType}\n${body}`)
          //     // now that you've got a listener, do something with the result...
          //
          //     // do something...
          //
          // })

          this.twitch.onVisibilityChanged((isVisible,_c)=>{
              this.visibilityChanged(isVisible)
          })

          this.twitch.onContext((context,delta)=>{
              this.contextUpdate(context,delta)
          })


      }

      // this.callApi()
      //   .then(console.log("Auth: " + this.Authentication.state.token))
      //   .catch(err => console.log(err));

  }

  callApi = async () => {
    console.log(this.Authentication.state.token);
    const response = await fetch("/api/getScream", {
      method: "GET",
      headers: {
        "authorization": this.Authentication.state.token
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

  handleStartSubmit = async e => {
    e.preventDefault();
    const response = await fetch ("/api/startVote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    this.setState(body);
  }

  handleEndSubmit = async e => {
    e.preventDefault();
    const response = await fetch ("/api/endVote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    this.setState(body);
  }

  handleVoteSubmit = async e => {
    e.preventDefault();
    console.log("OpaqueID: " + this.Authentication.getOpaqueId())
    const response = await fetch ("/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token,
        "userID": this.Authentication.getOpaqueId(),
        "vote": 3
      },
    });
    const body = await response.json();
    this.setState(body);
  }

  render() {

      if (this.state.finishedLoading && this.state.isVisible) {
          return (
              <div className="App">
                  <div className={this.state.theme === 'light' ? 'App-light' : 'App-dark'} >

                  {this.Authentication.isModerator() ? <Config isVoting={this.state.botState.isVoting} /> : "" }

                  {this.state.botState.isVoting ? <Voting options={this.state.botState.options} /> : <b>{this.state.botState.finalWord}</b>}

                      <p>{this.state.textToDisplay}</p>
                      <form onSubmit={this.handleSubmit}>
                        <button type="submit">Scream</button>
                      </form>
                      <form onSubmit={this.handleStartSubmit}>
                        <button type="submit">Start Vote</button>
                      </form>
                      <form onSubmit={this.handleEndSubmit}>
                        <button type="submit">End Vote</button>
                      </form>
                      <form onSubmit={this.handleVoteSubmit}>
                        <button type="submit">Vote for 3</button>
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
