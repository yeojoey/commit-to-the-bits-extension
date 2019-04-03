import React, { Component } from 'react';

// Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

class Config extends Component {

  constructor(props) {
    super(props)
    this.state = {
      queue: ""
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
    const response = await fetch ("/api/changeGame, {
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


  render() {
    return(
      <React.Fragment>
        <Col md="auto">
          <h4>Config Panel</h4>
          {this.props.currentGame === "FreezeTag" ? this.renderFreezeTag() : "" }
          {this.props.currentGame === "TSA" ? this.renderTSA() : "" }
          {this.props.currentGame === "Courtroom" ? this.renderCourtroom() : "" }
          {this.props.currentGame === "Music" ? this.renderMusic() : "" }
        </Col>
      </React.Fragment>
    )
  }

  renderMusic () {
    return (
      <React.Fragment><Row><Col>
      <div><h5>Current DJ: {this.props.currentDJ}</h5><br /><br />
      <Button onClick={() => this.handleGetNextDJ()}>Get Next DJ</Button></div>
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
        <Button onClick={() => this.handleChangeGame("FreezeTag")}>Start Freeze Tag</Button>
      </div>
      </Row></React.Fragment>
    )
  }

  renderFreezeTag () {
    return (
      <React.Fragment>
        <Button onClick={this.props.handleClear} variant="danger">Clear</Button>{' '}
        <Button onClick={this.props.handleStart} disabled={this.props.isVoting}>Start Vote</Button>{' '}
        <Button onClick={this.props.handleEnd} disabled={!this.props.isVoting}>End Vote</Button>{' '}
        <br /><br />
        <Button onClick={() => this.handleChangeGame("TSA")}>Start TSA Game</Button>{' '}
        <Button onClick={() => this.handleChangeGame("Courtroom")}>Start Courtroom</Button>{' '}
        <Button onClick={() => this.handleChangeGame("Music")}>Start Music</Button>
      </React.Fragment>
    )
  }

  renderTSA () {
    return (
      <React.Fragment>
        <Button onClick={() => this.handleChangeGame("FreezeTag")}>Start Freeze Tag</Button>{' '}
        <Button onClick={() => this.handleChangeGame("Courtroom")}>Start Courtroom</Button>{' '}
        <Button onClick={() => this.handleChangeGame("Music")}>Start Music</Button>
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
      <Button onClick={() => this.handleChangeGame("Music")}>Start Music</Button>
      </React.Fragment>
    )
  }

}

export default Config
