import React, { Component } from 'react';

class Config extends Component {
  state = {
    isVoting: false
  }

  constructor(props) {
    super(props)
  }

  handleClearClicked = async e => {
    e.preventDefault();
    const response = await fetch ("/api/postScream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    //this.setState(body);
  }


  handleStartVotingClicked = async e => {
    e.preventDefault();
    const response = await fetch ("/api/postScream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    //this.setState(body);
    this.setState({ isVoting: true });
  }


  handleEndVotingClicked = async e => {
    e.preventDefault();
    const response = await fetch ("/api/postScream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.Authentication.state.token
      }
    });
    const body = await response.json();
    //this.setState(body);
    this.setState({ isVoting: false });
  }

  render() {

    return(

      <div>
        <p>This is the config panel.</p>
        <input type="button" onClick={this.handleClearClicked} value="Clear" />
        <input type="button" onClick={this.handleStartVotingClicked} disabled={this.state.isVoting} value="Start Vote" />
        <input type="button" onClick={this.handleEndVotingClicked} disabled={!this.state.isVoting} value="End Vote" />
      </div>

    )
  }
}

export default Config
