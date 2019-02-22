import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

class Voting extends Component {

  constructor(props) {
    super(props)

    this.state = {
      votedBefore: false
    }
  }

  handleVote(i) {

    this.setState({votedBefore: true});

    this.props.handleVoteSubmit(i);
  }

  render() {

    return(
      <div>
      {this.state.votedBefore ?
        <p>Thanks for voting!</p> :
        <div>
          <p>Vote on an option:</p>
          <ButtonToolbar>
            <Button onClick={() => this.handleVote(0)}> {this.props.options ? this.props.options[0] : "test1"} </Button>
            <Button onClick={() => this.handleVote(1)}> {this.props.options ? this.props.options[1] : "test2"} </Button>
            <Button onClick={() => this.handleVote(2)}> {this.props.options ? this.props.options[2] : "test3"} </Button>
            <Button onClick={() => this.handleVote(3)}> {this.props.options ? this.props.options[3] : "test4"} </Button>
          </ButtonToolbar>
        </div>
      }
      </div>

    )
  }
}

export default Voting
