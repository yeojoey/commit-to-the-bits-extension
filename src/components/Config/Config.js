import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

class Config extends Component {

  constructor(props) {
    super(props)
  }

  render() {

    return(

      <div>
        <h3>Config Panel</h3>
        <ButtonToolbar>
        <Button onClick={this.props.handleClear} variant="danger">Clear</Button>{' '}
        <Button onClick={this.props.handleStart} disabled={this.props.isVoting}>Start Vote</Button>{' '}
        <Button onClick={this.props.handleEnd} disabled={!this.props.isVoting}>End Vote</Button>
        </ButtonToolbar>
      </div>

    )
  }
}

export default Config
