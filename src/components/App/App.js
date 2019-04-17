import React, { Component } from 'react';

// Components
import Authentication from '../../util/Authentication/Authentication'
import Config from '../Config/Config'
import Courtroom from '../Courtroom/Courtroom'
import FreezeTag from '../FreezeTag/FreezeTag'
import GuessingGame from '../GuessingGame/GuessingGame'
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
          currentGame: "FreezeTag",
          votedBefore: false,
          captain: "",
          inQueue: false,
          queuePosition: "",
          guestStar: "",
          guessingGame: {
            words: [{word: null, guesser: null, submitter: null}, {word: null, guesser: null, submitter: null}, {word: null, guesser: null, submitter: null}],
            answers: [{word: null, guesser: null, submitter: null}, {word: null, guesser: null, submitter: null}, {word: null, guesser: null, submitter: null}],
            phase: "Submission"
          }
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
            console.log("broadcast received");
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
        <Row className="justify-content-md-center Config">
          {this.Authentication.isModerator() ?
            <Config currentGame = {this.state.currentGame}
                    isVoting={this.state.isVoting}
                    authToken ={this.Authentication.state.token}
                    handleStart={this.handleStartSubmit}
                    handleEnd={this.handleEndSubmit}
                    handleClear={this.handleClear}
                    handleDequeue={this.handleDequeue}
                    handleGetGuestStar={this.handleGetGuestStar}
                    guestStar={this.state.guestStar}
                    currentDJ={this.state.dj}
                    selectedSongs={this.state.musicQueue}
                    guessingWords={this.state.guessingGame.words}
                    />
          : ""}
        </Row>
        { this.renderGame() }
        </React.Fragment>
      )
    } else {
      return (null)
    }
  }


  renderGame = () => {
    console.log(this.state.currentGame);
    if (this.state.currentGame === "FreezeTag") {
      return ( <React.Fragment>{ this.renderFreezeTag() }</React.Fragment> );
    }
    else if (this.state.currentGame === "TSA") {
      return ( <React.Fragment>{ this.renderTSA() }</React.Fragment> );
    } else if (this.state.currentGame === "Music") {
      return ( <React.Fragment>{ this.renderMusic() }</React.Fragment> );
    } else if (this.state.currentGame === "GuessingGame") {
      return (<React.Fragment> { this.renderGuessing() } </React.Fragment>)
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

  renderMusic = () => {
    return (<Music authToken={this.Authentication.state.token}
                    currentDJ={this.state.dj}
                    isDJ={this.state.isDJ}
                    inQueue={this.state.inDJBucket}
                    options={this.state.musicOptions}
                    canSelectSong={this.state.canSelectSong}
      />)
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
      <Courtroom authToken={this.Authentication.state.token}
                  inQueue={this.state.inQueue}
                  queuePosition={this.state.queuePosition}
                  handleEnqueue={this.handleEnqueue}
      />
    )
  }

  renderInstructions = () => {
    if (this.state.showInstructions) {
    return (
      <Instructions toggleInstructions={this.toggleInstructions}
                    currentGame={this.state.currentGame}
      />
    )
    } else {
      return (null);
    }
  }

  renderGuessing = () => {
    return (
      <GuessingGame authToken = {this.Authentication.state.token}
                    phase = {this.state.guessingGame.phase}
                    answers = {this.state.guessingGame.answers}/>
    )
  }

  renderHomepage = () => {
    return (
      <GuessingGame authToken = "123"
                    phase = {this.state.guessingGame.phase}
                    answers = {this.state.guessingGame.answers}/>
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
              <div className="App">
                <Container fluid={true}>
                  {this.renderHeader()}
                  <Row className="justify-content-md-center Config">
                  <Config currentGame = {this.state.currentGame}
                          isVoting={this.state.isVoting}
                          authToken ={this.Authentication.state.token}
                          handleStart={this.handleStartSubmit}
                          handleEnd={this.handleEndSubmit}
                          handleClear={this.handleClear}
                          handleDequeue={this.handleDequeue}
                          handleGetGuestStar={this.handleGetGuestStar}
                          guestStar={this.state.guestStar}
                          currentDJ={this.state.dj}
                          selectedSongs={this.state.musicQueue}
                          guessingWords = {this.state.guessingGame.words}
                          />
                    </Row>
                  {this.renderHomepage()}
                </Container>
              </div>
              {this.renderInstructions()}
            </React.Fragment>
          )
      }
      return (null);
  }
}

export default App;
