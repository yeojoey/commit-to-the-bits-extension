import React, { Component } from 'react';

// Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

class Config extends Component {

  constructor(props) {
    super(props)
    this.state = {
      queue: "",
      guessingWords: [{word: null, submitter: null}, {word: null, submitter: null}, {word: null, submitter: null}]
    }
  }

  stringifyQueue(queue) {
    var str = "";
    for (var i = 0; i < queue.length; i ++) {
      str += queue[i].discordTag + ", ";
    }
    console.log(str);
    return str;
  }

  // Freeze Tag Handlers

  handleStartVote = async e => {
    e.preventDefault();
    const response = await fetch ("/api/startVote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken
      }
    });
    const body = await response.json();
  }

  handleEndVote = async e => {
    e.preventDefault();
    const response = await fetch ("/api/endVote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken
      }
    });
    const body = await response.json();
  }

  handleGetQueue = async e => {
    e.preventDefault();
    const response = await fetch ("/api/getQueue", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken
      }
    });
    const body = await response.json();
    console.log(body);
    this.setState({
      queue: this.stringifyQueue(body.queue)
    });
  }

  handleChangeGame = async (game) => {
    const response = await fetch ("/api/changeGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken,
        "game": game
      }
    });
    const body = await response.json();
  }

  handleGetNextDJ = async () => {
    const response = await fetch ("/api/getDJ", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken
      }
    });
    const body = await response.json();
  }

  getGuessingWord = async (e) => {
    console.log(e.target.wordType);
    const response = await fetch ("/api/getWord", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken,
        "type": e.target.wordType
      }
    });
    const body = await response.json();
  }


  render() {
    return(
      <React.Fragment>
        <h5>Config Panel</h5>
        {this.props.currentGame === "FreezeTag" ? this.renderFreezeTag() : "" }
        {this.props.currentGame === "TSA" ? this.renderTSA() : "" }
        {this.props.currentGame === "Courtroom" ? this.renderCourtroom() : "" }
        {this.props.currentGame === "Music" ? this.renderMusic() : "" }
        {this.props.currentGame === "GuessingGame" ? this.renderGuessing() : "" }
      </React.Fragment>
    )
  }

  renderGuessing () {
    return (
      <React.Fragment>
      <Row>
      <Button>Start Guessing Phase</Button>
      </Row>
      <Row>
        <Col className="col-sm">
        {this.state.answers[0].word === null ? <h5>None yet</h5>
          :
          <div>
            <h5>{this.state.answers[0].word}</h5>
            <h6>Submitted by: {this.state.answers[0].submitter}</h6>
          </div>
        }
        <Button wordType="noun" onClick={() => this.getGuessingWord()}>Get New Noun</Button>
        </Col>
        <Col className="col-sm">
        {this.state.answers[1].word === null ? <h5>None yet</h5>
          :
          <div>
            <h5>{this.state.answers[1].word}</h5>
            <h6>Submitted by: {this.state.answers[1].submitter}</h6>
          </div>
        }
        <Button>Get New Verb</Button>
        </Col>
        <Col className="col-sm">
        {this.state.answers[2].word === null ? <h5>None yet</h5>
          :
          <div>
            <h5>{this.state.answers[2].word}</h5>
            <h6>Submitted by: {this.state.answers[2].submitter}</h6>
          </div>
        }
        <Button>Get New Location</Button>
        </Col>
        </Row>
        <Row>
        <div>
          <Button onClick={() => this.handleChangeGame("TSA")}>Start TSA Game</Button>{' '}
          <Button onClick={() => this.handleChangeGame("Courtroom")}>Start Courtroom</Button>{' '}
          <Button onClick={() => this.handleChangeGame("FreezeTag")}>Start Freeze Tag</Button>{' '}
          <Button onClick={() => this.handleChangeGame("Music")}>Start Music Game</Button>
        </div>
        </Row>
      </React.Fragment>
    )
  }

  renderMusic () {
    return (
      <React.Fragment><Row><Col>
      <div><h5>Current DJ: {this.props.currentDJ}</h5></div>
      <div><Button onClick={() => this.handleGetNextDJ()}>Get Next DJ</Button></div>
      </Col>
      <Col>
      <h5>Selected songs</h5>
      <ol>
        <li>{this.props.selectedSongs[0]}</li>
        <li>{this.props.selectedSongs[1]}</li>
        <li>{this.props.selectedSongs[2]}</li>
      </ol>
      </Col>
      </Row>
      <Row>
      <div>
        <Button onClick={() => this.handleChangeGame("TSA")}>Start TSA Game</Button>{' '}
        <Button onClick={() => this.handleChangeGame("Courtroom")}>Start Courtroom</Button>{' '}
        <Button onClick={() => this.handleChangeGame("FreezeTag")}>Start Freeze Tag</Button>{' '}
        <Button onClick={() => this.handleChangeGame("GuessingGame")}>Start Guessing Game</Button>
      </div>
      </Row></React.Fragment>
    )
  }

  renderFreezeTag () {
    return (
      <React.Fragment>
        <Button onClick={this.props.handleClear} variant="danger">Clear</Button>{' '}
        <Button onClick={this.handleStartVote} disabled={this.props.isVoting}>Start Vote</Button>{' '}
        <Button onClick={this.handleEndVote} disabled={!this.props.isVoting}>End Vote</Button>{' '}
        <br /><br />
        <Button onClick={() => this.handleChangeGame("TSA")}>Start TSA Game</Button>{' '}
        <Button onClick={() => this.handleChangeGame("Courtroom")}>Start Courtroom</Button>{' '}
        <Button onClick={() => this.handleChangeGame("Music")}>Start Music Game</Button>{' '}
        <Button onClick={() => this.handleChangeGame("GuessingGame")}>Start Guessing Game</Button>
      </React.Fragment>
    )
  }

  renderTSA () {
    return (
      <React.Fragment>
        <Button onClick={() => this.handleChangeGame("FreezeTag")}>Start Freeze Tag</Button>{' '}
        <Button onClick={() => this.handleChangeGame("Courtroom")}>Start Courtroom</Button>{' '}
        <Button onClick={() => this.handleChangeGame("Music")}>Start Music Game</Button>{' '}
        <Button onClick={() => this.handleChangeGame("GuessingGame")}>Start Guessing Game</Button>
      </React.Fragment>
    )
  }

  renderCourtroom () {
    return (
      <React.Fragment>
      {this.state.queue}
      <br /><br />
      <Button onClick={this.handleGetQueue}>Show Queue</Button>{' '}
      <Button onClick={this.props.handleDequeue}>Get Next Guest Star</Button>
      <br /> <br />
      <Button onClick={() => this.handleChangeGame("FreezeTag")}>Start Freeze Tag</Button>{' '}
      <Button onClick={() => this.handleChangeGame("TSA")}>Start TSA Game</Button>{' '}
      <Button onClick={() => this.handleChangeGame("Music")}>Start Music Game</Button>{' '}
      <Button onClick={() => this.handleChangeGame("GuessingGame")}>Start Guessing Game</Button>
      </React.Fragment>
    )
  }

}

export default Config
