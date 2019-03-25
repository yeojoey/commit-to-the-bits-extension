import React, { Component } from 'react';

// Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';

class Config extends Component {

  constructor(props) {
    super(props)
  }

  render() {

    return(
      <React.Fragment>
      <Col md="auto">
        <h4>Config Panel</h4>
        <Button onClick={this.props.handleClear} variant="danger">Clear</Button>{' '}
        <Button onClick={this.props.handleStart} disabled={this.props.isVoting}>Start Vote</Button>{' '}
        <Button onClick={this.props.handleEnd} disabled={!this.props.isVoting}>End Vote</Button>{' '}
        <br /><br />
        <Button onClick={() => this.props.handleChangeGame("TSA")}>Start TSA Game</Button>{' '}
        <Button onClick={() => this.props.handleChangeGame("FreezeTag")}>Start Freeze Tag</Button>{' '}
        <Button onClick={() => this.props.handleChangeGame("Courtroom")}>Start Courtroom</Button>
      </Col>
      </React.Fragment>
    )
  }
}

export default Config
