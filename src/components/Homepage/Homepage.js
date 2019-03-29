import React, { Component } from 'react';

class Homepage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      queue: ""
    }
  }

  render () {
    return (
      <div className="Homepage">
        <h4 className="obs">Current Prompt</h4>
        <h3 className="obs">{this.props.freezeTagPrompt}</h3>
      </div>
    )
  }

}

export default Homepage
