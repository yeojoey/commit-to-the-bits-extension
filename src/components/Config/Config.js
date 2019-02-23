import React, { Component } from 'react';

// Styling
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';

class Config extends Component {

  constructor(props) {
    super(props)
  }

  render() {

    return(

      <Col md="auto">
        <h3>Config Panel</h3>
        <ButtonToolbar>
        <Button onClick={this.props.handleClear} variant="danger">Clear</Button>{' '}
        <Button onClick={this.props.handleStart} disabled={this.props.isVoting}>Start Vote</Button>{' '}
        <Button onClick={this.props.handleEnd} disabled={!this.props.isVoting}>End Vote</Button>
        </ButtonToolbar>
      </Col>

    )
  }
}

export default Config
