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
    const response = await fetch ("/api/chooseMusic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken,
        "music": choice
      }
    });
    const body = await response.json();
  }

  renderJoinQueue () {
    return (
      <div>
      {this.renderCurrentDJ()}
      <h5>If you want to be selected as a DJ, click the button below.</h5>
      <Button onClick = {() => this.joinQueue() }>Pick me!</Button>
      </div>
    )
  }

  renderCurrentDJ () {
    return (
      <div>
      <h5>The current DJ is: {this.props.currentDJ === "" ? "No one" : this.props.currentDJ}</h5>
      </div>
    )
  }

  renderInQueue () {
    return (
      <div>
      {this.renderCurrentDJ()}
      <h5>You are in line to be the DJ.</h5>
      </div>
    );
  }

  renderDJ () {
    return (
      <div>
      <h4>You're the DJ!</h4>
        <div>
        {this.props.canSelectSong ?
          <React.Fragment>
          <h5>Choose the next song</h5>
          <Button onClick={() => this.handleSelectSong(this.props.options[0])}>{this.props.options[0]}</Button>{' '}
          <Button onClick={() => this.handleSelectSong(this.props.options[1])}>{this.props.options[1]}</Button>{' '}
          <Button onClick={() => this.handleSelectSong(this.props.options[2])}>{this.props.options[2]}</Button>{' '}
          </React.Fragment>
          :
          <h5>Thanks for creating a playlist!</h5>
        }
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
