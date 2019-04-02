import React, { Component } from 'react';

// Components
import Authentication from '../../util/Authentication/Authentication'
import Config from '../Config/Config'
import Courtroom from '../Courtroom/Courtroom'
import FreezeTag from '../FreezeTag/FreezeTag'
import Homepage from '../Homepage/Homepage'
import Instructions from '../Instructions/Instructions'
import Music from '../Music/Music'

// Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';

import './App.css';

class App extends Component {
  state = {
    response: "",
    post: "",
    responseToPost: "",
    textToDisplay: "",
    characterSuggestion: "",
    captain: "",
    inQueue: false,
    queuePosition: "",
    showPanel: "",
    showInstructions: "",
    currentGame: "",
    votedBefore: false,
    guestStar: "",
    isVoting: false,
    finalWord: "",
    options: ""
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
          showPanel: true,
          showInstructions: false,
          currentGame: "",
          votedBefore: false,
          captain: "",
          inQueue: false,
          queuePosition: "",
          guestStar: ""
      }

      this.togglePanel = this.togglePanel.bind(this);
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

              this.getState()
                .then()
                .catch(err => console.log(err));

          })

          this.twitch.listen("broadcast", (target, contentType, message) => {
            this.setState(JSON.parse(message));
            this.getState();
          })

          this.twitch.onVisibilityChanged((isVisible,_c)=>{
              this.visibilityChanged(isVisible)
          })

          this.twitch.onContext((context,delta)=>{
              this.contextUpdate(context,delta)
          })


      }

  }

  getState = async () => {
    const response = await fetch("/api/getBotState", {
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
    console.log("Vote Started. isVoting set to "+this.state.isVoting);
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
    console.log("Vote Ended. isVoting set to "+this.state.isVoting);
  }

  handleCaptain = async e => {
    e.preventDefault();
    const response = await fetch ("/api/getCaptain", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    this.setState(body);
  }

  handleEnqueue = async (discordTag) => {
    console.log("attempting to enqueue " + discordTag);
    const response = await fetch ("/api/enqueueAudienceMember", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token,
        "discordTag": discordTag
      }
    });
    const body = await response.json();
    this.setState(body);
  }

  handleDequeue = async e => {
    e.preventDefault();
    const response = await fetch ("/api/dequeueAudienceMember", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    console.log("Guest Star: " + body.guestStar);
    this.setState(body);
  }

  handleGetGuestStar = async e => {
    e.preventDefault();
    const response = await fetch ("/api/getHeadOfQueue", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    console.log("Guest Star: " + body.guestStar);
    this.setState(body);
  }

  handleClear = async e => {
    e.preventDefault();
    const response = await fetch ("/api/clear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    this.setState(body);
  }

  togglePanel = () => {
    this.setState((state) => {
      return { showPanel: !state.showPanel }
    });
  }

  toggleInstructions = () => {
    this.setState((state) => {
      return { showInstructions: !state.showInstructions }
    });
  }

  // Helper functions for rendering
   renderHeader = () => {
    return (
      <div class="floating-header">
        <Button onClick={this.toggleInstructions}>Instructions</Button>{' '}
        <Button onClick={this.togglePanel}>{ this.state.showPanel ? "Hide" : "Show" }</Button>
      </div>
    )
  }

  renderBody = () => {
    if (this.state.showPanel) {
      return (
        <React.Fragment>
        <Row className="justify-content-md-center">
          {this.Authentication.isModerator() ?
            <Config currentGame = {this.state.currentGame}
                    isVoting={this.state.isVoting}
                    authToken ={this.Authentication.state.token}
                    handleStart={this.handleStartSubmit}
                    handleEnd={this.handleEndSubmit}
                    handleClear={this.handleClear}
                    handleDequeue={this.handleDequeue}
                    handleChangeGame={this.handleChangeGame}
                    handleGetGuestStar={this.handleGetGuestStar}
                    guestStar={this.state.guestStar}
                    currentDJ={this.state.dj}
                    selectedSongs={this.state.musicQueue}
                    />
          : ""}
        </Row>
        { this.renderGame() }
        </React.Fragment>
      )
    }
  }

  renderGame = () => {
    if (this.state.currentGame === "FreezeTag") {
      return ( <React.Fragment>{ this.renderFreezeTag() }</React.Fragment> );
    }

    else if (this.state.currentGame === "TSA") {
      return ( <React.Fragment>{ this.renderTSA() }</React.Fragment> );

    } else {
      return ( <React.Fragment>{ this.renderCourtroom() }</React.Fragment> );
    }

  }

  renderFreezeTag = () => {
    return (
        <FreezeTag
        authToken={this.Authentication.state.token}
        isVoting={this.state.isVoting}
        finalWord={this.state.finalWord}
        options={this.state.options}
        votedBefore={this.state.votedBefore}/>
    )
  }

  renderTSA = () => {
    return (
      <Row className="justify-content-md-center">
        <div><h3>
        <a href="https://drive.google.com/drive/folders/1LbIjPZp2xjq_AsMxN_QjfNWH3wA832aY?usp=sharing">Submit Drawings Here</a></h3>
        <h5>(Right-click and open link in new window)</h5>
        </div>
      </Row>
    )
  }

  renderCourtroom = () => {
    return (
      <Instructions toggleInstructions={this.toggleInstructions}
                    currentGame={this.state.currentGame}
      />
    )
  }

  renderHomepage = () => {
    return (
      <b>Something disappeared here</b>
    )
  }

  render() {
      if (this.state.finishedLoading && this.state.isVisible) {
          return (
            <React.Fragment>
              <div className="App">
                <Container fluid={true}>
                  {this.renderHeader()}
                  {this.renderBody()}
                </Container>
              </div>
              {this.renderInstructions()}
            </React.Fragment>
          )
      } else {
          return (
            <React.Fragment>
              {this.renderHomepage()}
            </React.Fragment>
          )
      }
  }
}

export default App;
