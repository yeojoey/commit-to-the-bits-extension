import React, { Component } from 'react';

// Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

class Music extends Component {

  constructor (props) {
    super (props)
    this.joinQueue = this.joinQueue.bind(this);
    this.handleSelectSong = this.handleSelectSong.bind(this);
  }

  joinQueue = async () => {
    const response = await fetch ("/api/getInDJBucket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken
      }
    });
    const body = await response.json();
  }

  handleSelectSong = async (choice) => {

  }

  renderJoinQueue () {
    return (
      <div>
      {this.renderCurrentDJ()}
      <Button onClick = {() => this.joinQueue() }>Join Queue</Button>
      </div>
    )
  }

  renderCurrentDJ () {
    return (
      <div>
      <h5>The current DJ is: {this.props.currentDJ}</h5>
      </div>
    )
  }

  renderInQueue () {
    return (
      <div>
      {this.renderCurrentDJ()}
      <h4>You are in line.</h4>
      </div>
    );
  }

  renderDJ () {
    return (
      <div>
      <h4>You're the DJ!</h4>
        <div>
          <h5>Choose the next song</h5>
          <Button onClick={() => this.handleSelectSong(this.props.options[0])}>{this.props.options[0]}</Button>{' '}
          <Button onClick={() => this.handleSelectSong(this.props.options[1])}>{this.props.options[1]}</Button>{' '}
          <Button onClick={() => this.handleSelectSong(this.props.options[2])}>{this.props.options[2]}</Button>{' '}
        </div>
      </div>
    )
  }

  render () {
    if (this.props.isDJ) {
      return( <Row className="justify-content-md-center mx-5"><Col>{this.renderDJ()}</Col></Row>);
    } else {
      if (!this.props.inQueue) {
        return(<Row className="justify-content-md-center mx-5"><Col>{this.renderJoinQueue()}</Col></Row>);
      } else {
        return(<Row className="justify-content-md-center mx-5"><Col>{this.renderInQueue()}</Col></Row>);
      }
    }
  }

}

export default Music
