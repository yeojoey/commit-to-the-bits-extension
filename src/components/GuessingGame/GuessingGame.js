import React, { Component } from 'react';

//Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';

class GuessingGame extends Component {

  constructor(props) {
    super(props)

    this.state = {
      nounSubmission: "",
      verbSubmission: "",
      locationSubmission: ""
    }
  }

  submit = async () => {

    // Submission phase
    if (this.props.phase === "Submission") {

    }
    // Guessing phase
    else {

    }

  }

  handleChange (event) {
    if (event.target.wordType === "noun") {
      this.setState({
        nounSubmission: event.target.value
      })
    } else if (event.target.wordtype === "verb") {
      this.setState({
        verbSubmission: event.target.value
      })
    } else {
      this.setState({
        locationSubmission: event.target.value
      })
    }

  }

  renderSubmission() {
    return (
      <React.Fragment>
        <Row className="justify-content-md-center mx-5">
          <h5>Submission Phase</h5>
        </Row>
        <Row className="justify-content-md-center mx-5">
          <Col>
          <h5>Noun</h5>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. fisherman" wordType="noun" value={this.state.nounSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} wordType="noun" onClick={() => this.submitNoun()} >Submit</Button>
          </InputGroup>
          </Col>
          <Col>
          <h5>Verb</h5>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. driving" wordType="verb" value={this.state.verbSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} wordType="verb" onClick={() => this.submitVerb()}>Submit</Button>
          </InputGroup>
          </Col>
          <Col>
          <h5>Location</h5>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. classroom" wordType="location"  value={this.state.locationSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} wordType="location" onClick={() => this.submitLocation()}>Submit</Button>
          </InputGroup>
          </Col>
        </Row>
      </React.Fragment>
    )
  }

  renderGuessing() {
    return (
      <React.Fragment>
        <Row className="justify-content-md-center mx-5">
          <h5>Submission Phase</h5>
        </Row>
        <Row className="justify-content-md-center mx-5">
          <Col>
          <h5>Noun</h5>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. fisherman" wordType="noun" value={this.state.nounSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} wordType="noun" onClick={() => this.submitNoun()} >Submit</Button>
          </InputGroup>
          <h6>Guessed by: charlieparke</h6>
          </Col>
          <Col>
          <h5>Verb</h5>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. driving" wordType="verb" value={this.state.verbSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} wordType="verb" onClick={() => this.submitVerb()}>Submit</Button>
          </InputGroup>
          <h6>Guessed by: charlieparke</h6>
          </Col>
          <Col>
          <h5>Location</h5>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. classroom" wordType="location"  value={this.state.locationSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} wordType="location" onClick={() => this.submitLocation()}>Submit</Button>
          </InputGroup>
          <h6>Guessed by: charlieparke</h6>
          </Col>
        </Row>
      </React.Fragment>
    )
  }

  render () {
    if (this.props.phase === "Submission") {
      this.renderSubmission();
    } else if (this.props.phase === "Guessing") {
      this.renderGuessing();
    }
    else {
      return (
        <React.Fragment>
        {this.renderSubmission()}
        </React.Fragment>
      )
      //return (null)
    }
  }

}

export default GuessingGame;
