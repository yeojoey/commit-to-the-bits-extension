import React, { Component } from 'react';

// Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';

class Voting extends Component {

  constructor(props) {
    super(props)

  }

  handleVote(i) {
    this.props.handleVoteSubmit(i);
  }

  render() {

    return(
      <Col md="auto">
      <h3>Voting Period</h3>
      {this.props.votedBefore ?
        <h4>Thanks for voting!</h4> :
        <div>
          <h4>Vote on a suggestion:</h4>
          <Button onClick={() => this.handleVote(0)}> {this.props.options ? this.props.options[0] : "test1"} </Button>{' '}
          <Button onClick={() => this.handleVote(1)}> {this.props.options ? this.props.options[1] : "test2"} </Button>{' '}
          <Button onClick={() => this.handleVote(2)}> {this.props.options ? this.props.options[2] : "test3"} </Button>{' '}
          <Button onClick={() => this.handleVote(3)}> {this.props.options ? this.props.options[3] : "test4"} </Button>
        </div>
      }
      </Col>

    )
  }
}

export default Voting
