import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

class Homepage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      freezeTagPrompt: ""
    }
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick = async () => {
    const response = await fetch ("/api/getFreezeTagPrompt", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const body = await response.json();
    this.setState(body);
  }

  render () {
    return (
      <div className="Homepage">
        <h4 className="obs">Current Prompt: {this.state.freezeTagPrompt}</h4>
        <br /> <br />
        <Button onClick={() => this.handleClick()}>Get Latest Freeze Tag Prompt</Button>
      </div>
    )
  }

}

export default Homepage
