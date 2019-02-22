import React, { Component } from 'react';

class Config extends Component {

  constructor(props) {
    super(props)
  }

  render() {

    return(

      <div>
        <p>This is the config panel.</p>
        <input type="button" onClick={this.props.handleClear} value="Clear" />
        <input type="button" onClick={this.props.handleStart} disabled={this.props.isVoting} value="Start Vote" />
        <input type="button" onClick={this.props.handleEnd} disabled={!this.props.isVoting} value="End Vote" />
      </div>

    )
  }
}

export default Config
