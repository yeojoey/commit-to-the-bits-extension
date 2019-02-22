import React, { Component } from 'react';

class Voting extends Component {

  constructor(props) {
    super(props)

    this.state = {
      votedBefore: false
    }
  }

  handleVote(i) {

    this.state = {
      votedBefore: true
    }

    this.props.handleVoteSubmit(i);
  }

  render() {

    return(

      <div>
        <p>Vote on an option:</p>
        <input type="button" onClick={() => this.props.handleVote(0)} value={this.props.options ? this.props.options[0] : "test1"} />
        <input type="button" onClick={() => this.props.handleVote(1)} value={this.props.options ? this.props.options[1] : "test2"} />
        <input type="button" onClick={() => this.props.handleVote(2)} value={this.props.options ? this.props.options[2] : "test3"} />
        <input type="button" onClick={() => this.props.handleVote(3)} value={this.props.options ? this.props.options[3] : "test4"} />
      </div>

    )
  }
}

export default Voting
