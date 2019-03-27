import React, { Component } from 'react';

// Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';

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


  render() {
    return(
      <React.Fragment>
        <Col md="auto">
          <h4>Config Panel</h4>
          {this.props.currentGame === "FreezeTag" ? this.renderFreezeTag() : "" }
          {this.props.currentGame === "TSA" ? this.renderTSA() : "" }
          {this.props.currentGame === "Courtroom" ? this.renderCourtroom() : "" }
        </Col>
      </React.Fragment>
    )
  }

  renderFreezeTag () {
    return (
      <React.Fragment>
        <Button onClick={this.props.handleClear} variant="danger">Clear</Button>{' '}
        <Button onClick={this.props.handleStart} disabled={this.props.isVoting}>Start Vote</Button>{' '}
        <Button onClick={this.props.handleEnd} disabled={!this.props.isVoting}>End Vote</Button>{' '}
        <br /><br />
        <Button onClick={() => this.props.handleChangeGame("TSA")}>Start TSA Game</Button>{' '}
        <Button onClick={() => this.props.handleChangeGame("Courtroom")}>Start Courtroom</Button>
      </React.Fragment>
    )
  }

  renderTSA () {
    return (
      <React.Fragment>
        <Button onClick={() => this.props.handleChangeGame("FreezeTag")}>Start Freeze Tag</Button>{' '}
        <Button onClick={() => this.props.handleChangeGame("Courtroom")}>Start Courtroom</Button>
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
      <Button onClick={() => this.props.handleChangeGame("FreezeTag")}>Start Freeze Tag</Button>{' '}
      <Button onClick={() => this.props.handleChangeGame("TSA")}>Start TSA Game</Button>
      </React.Fragment>
    )
  }

}

export default Config
