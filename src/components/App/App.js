import React, { Component } from 'react';

// Components
import Authentication from '../../util/Authentication/Authentication'
import Config from '../Config/Config'
import Voting from '../Voting/Voting'

// Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';

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
    botState: "",
    captain: "",
    showPanel: "",
    showInstructions: "",
    currentGame: ""
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
          botState: testState,
          showPanel: true,
          showInstructions: false,
          currentGame: "Freeze Tag"
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

              this.getInitialState()
                .then()
                .catch(err => console.log(err));

          })

          this.twitch.listen("broadcast", (target, contentType, message) => {
            this.setState(JSON.parse(message));
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

      // this.getInitialState()
      //   .then(console.log("Auth: " + this.Authentication.state.token))
      //   .catch(err => console.log(err));

  }

  getInitialState = async () => {
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

  handleVoteSubmit = async (vote) => {
      //e.preventDefault();
      const userID = this.Authentication.getOpaqueId();
      const response = await fetch ("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": this.Authentication.state.token,
          "userID": userID,
          "vote": vote
        },
      });
      const body = await response.json();
      this.setState(body);
  }

  handleVote = (a) => {
    this.handleVoteSubmit(a);
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
    console.log(JSON.stringify(body));
    this.setState(body);
  }

  handleChangeToTSA = async e => {
    e.preventDefault();
    const response = await fetch ("/api/changeToTSA", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    this.setState(body);
    console.log(this.state.captain)
  }

  handleChangeToFreezeTag = async e => {
    e.preventDefault();
    const response = await fetch ("/api/changeToFreezeTag", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
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
      <Row className="justify-content"><Col>
        <div class="float-right">
          <Button onClick={this.toggleInstructions}>Instructions</Button>{' '}
          <Button onClick={this.togglePanel}>{ this.state.showPanel ? "Hide" : "Show" }</Button>
        </div>
      </Col></Row>
    )
  }

  renderBody = () => {
    if (this.state.showPanel) {
      return (
        <React.Fragment>
        <Row className="justify-content-md-center">
          {this.Authentication.isModerator() ?
            <Config isVoting={this.state.botState.isVoting}
                    handleStart={this.handleStartSubmit}
                    handleEnd={this.handleEndSubmit}
                    handleClear={this.handleClear}
                    handleChangeToTSA={this.handleChangeToTSA}
                    handleChangeToFreezeTag={this.handleChangeToFreezeTag} />
          : ""}
        </Row>
        { this.state.currentGame == "Freeze Tag" ?  this.renderFreezeTag() : this.renderTSA() }
        </React.Fragment>
      )
    }
  }

  renderFreezeTag = () => {
    return (
      <Row className="justify-content-md-center">
        <div>
          <h4>Current Prompt:</h4>
          <h3>{this.state.botState.finalWord}</h3>
        </div>
        <div>
          {this.state.botState.isVoting ? <Voting options={this.state.botState.options} handleVoteSubmit={this.handleVote} /> : ""
          }
        </div>
      </Row>
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

  renderDebugBody = () => {
    if (this.state.showPanel) {
      return (
        <React.Fragment>
        <Row className="justify-content-md-center">
            <Config isVoting={this.state.botState.isVoting}
                    handleStart={this.handleStartSubmit}
                    handleEnd={this.handleEndSubmit}
                    handleClear={this.handleClear}
                    handleChangeToTSA={this.handleChangeToTSA} />
        </Row>
        { this.state.currentGame == "Freeze Tag" ?  this.renderFreezeTag() : this.renderTSA() }
        </React.Fragment>
      )
    }
  }

  renderInstructions = () => {
    if (this.state.showInstructions) {
      return (
        <Modal.Dialog>
          <Modal.Header closeButton onClick={this.toggleInstructions}>
            <Modal.Title>Instructions</Modal.Title>
          </Modal.Header>
          { this.state.currentGame == "Freeze Tag" ?
          <Modal.Body>
            <p>In Freeze Tag, 2 performers act out a scene.  At a certain point, the host or other performers
            will shout out "Freeze!" and the performers stop moving.  A new performer gets a suggestion from the
            audience, then taps on one of the frozen performers and takes their place.  The scene then starts
            again with the new performer tying their suggestion into the story.</p>

            <p>Guests interact by typing in chat to suggest characters, relationships, objectives, and locations.
            A character suggestion would look like "!c batman" (!r for relationship, !o for objective, and !w
            for where). </p>

            <p>Vote on your favorite suggestion by clicking the corresponding button on the screen.</p>
          </Modal.Body>
          :
          <Modal.Body>
            <p>In TSA, audience members submit drawings of the contents of a traveller's bag.  One performer as a TSA
            Agent will interrogate the traveller as they try to justify increasingly random security X-Rays.</p>

            <p>You will be submitting these pictures.  Please open up MS Paint and draw whatever comes to mind.  Submit
            it by simply dropping it in this <a href="https://drive.google.com/drive/folders/1LbIjPZp2xjq_AsMxN_QjfNWH3wA832aY?usp=sharing" target="_blank">Google
            Drive folder</a>.</p>

            <p>Have fun making this traveller's day more difficult!</p>
          </Modal.Body>
          }
          <Modal.Footer>
            <Button variant="secondary" onClick={this.toggleInstructions}>Close</Button>
          </Modal.Footer>
        </Modal.Dialog>
    )}
  }

  render() {

      if (this.state.finishedLoading && this.state.isVisible) {
          return (
            <React.Fragment>
              <div className="App">
                <Container fluid={true}>
                  {this.renderHeader()}
                  {this.renderBody()}
                  <Button variant="secondary" onClick={this.handleCaptain}>Get Cap</Button>
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
                  {this.renderDebugBody()}
                </Container>
              </div>
              {this.renderInstructions()}
            </React.Fragment>
          )
      }
  }
}

export default App;
