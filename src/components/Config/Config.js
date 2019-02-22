import React, { Component } from 'react';

class Config extends Component {

  constructor(props) {
    super(props)
  }

  handleClear = async e => {

  }

  handleStartVote = async e=> {

  }

  handleEndVote = async e => {

  }

  render() {

    return(

      <div>
        <p>This is the config panel.</p>
        <input type="button" onClick={this.handleClear} value="Clear" />
        <input type="button" onClick={this.handleStartVote} disabled={this.props.isVoting} value="Start Vote" />
        <input type="button" onClick={this.handleEndVote} disabled={!this.props.isVoting} value="End Vote" />
      </div>

    )
  }
}

export default Config
