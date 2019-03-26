import React, { Component } from 'react';

// Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';

class Courtroom extends Component {

  constructor(props) {
    super(props)
    this.state = {
      discordTag: ""
    }
    this.handleChange = this.handleChange.bind(this);
    console.log(this.props.queue + " " + this.props.pos);
  }

  handleChange(event) {
    this.setState( { discordTag: event.target.value } );
  }

  render () {
    return (
      <Row className="justify-content-md-center mx-5">
        <Col>
          <h3>Courtroom Game</h3>
          <h5>{this.props.queue === "" ? "You are not in line." : "You are in line."}</h5>
          <InputGroup>
          <FormControl placeholder="Discord tag e.g. CommitToTheBits#1234" value={this.state.discordTag} onChange={this.handleChange}>
          </FormControl>
            <InputGroup.Append>
              <Button onClick={this.props.handleEnqueue(this.state.discordTag)}>Join Queue</Button>
            </InputGroup.Append>
          </InputGroup>
        </Col>
      </Row>
    )
  }

}

export default Courtroom
