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
      locationSubmission: "",
      answers: [{word: null, guesser: null, submitter: null}, {word: null, guesser: null, submitter: null}, {word: "bathroom", guesser: "committothebits", submitter: "charlieparke"}]
    }
    this.handleChange = this.handleChange.bind(this);
  }

  submitWord = async (event) => {
    // Submission phase
    if (this.props.phase === "Submission") {
      console.log(event.target.id);
    }
    // Guessing phase
    else {
    }
  }

  handleChange =  (event) => {
    console.log("Word type: " + event.target.id);
    if (event.target.id === "noun") {
      this.setState({
        nounSubmission: event.target.value
      })
    } else if (event.target.id === "verb") {
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
          <Col className="col-sm">
          <h6>Noun</h6>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. fisherman" id="noun" value={this.state.nounSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} id="noun" onClick={() => this.submitWord()} >Submit</Button>
          </InputGroup>
          </Col>
          <Col className="col-sm">
          <h6>Verb</h6>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. driving" id="verb" value={this.state.verbSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} id="verb" onClick={() => this.submitWord()}>Submit</Button>
          </InputGroup>
          </Col>
          <Col className="col-sm">
          <h6>Location</h6>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. classroom" id="location"  value={this.state.locationSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} id="location" onClick={() => this.submitWord()}>Submit</Button>
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
          <h5>Guessing Phase</h5>
        </Row>
        <Row className="justify-content-md-center mx-5">
          <Col className="col-sm">
          <h6>Noun</h6>
          {
            this.state.answers[0].word === null ?
            <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
              <FormControl placeholder="e.g. fisherman" id="noun" value={this.state.nounSubmission} onChange={this.handleChange}/>
              <Button as={InputGroup.Append} id="noun" onClick={() => this.submitNoun()} >Submit</Button>
            </InputGroup>
            :
            <div>
              <h4>{this.state.answers[0].word}</h4>
              <h6>Guessed by: {this.state.answers[0].guesser}</h6>
              <h6>Submitted by: {this.state.answers[0].submitter}</h6>
            </div>
          }

          </Col>
          <Col className="col-sm">
          <h6>Verb</h6>
          {
            this.state.answers[1].word === null ?
            <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
              <FormControl placeholder="e.g. driving" id="verb" value={this.state.verbSubmission} onChange={this.handleChange}/>
              <Button as={InputGroup.Append} id="verb" onClick={() => this.submitVerb()}>Submit</Button>
            </InputGroup>
            :
            <div>
              <h4>{this.state.answers[1].word}</h4>
              <h6>Guessed by: {this.state.answers[1].guesser}</h6>
              <h6>Submitted by: {this.state.answers[0].submitter}</h6>
            </div>
          }
          </Col>
          <Col className="col-sm">
          <h6>Location</h6>
          {
            this.state.answers[2].word === null ?
            <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
              <FormControl placeholder="e.g. classroom" id="location"  value={this.state.locationSubmission} onChange={this.handleChange}/>
              <Button as={InputGroup.Append} id="location" onClick={() => this.submitLocation()}>Submit</Button>
            </InputGroup>
            :
            <div>
              <h4>{this.state.answers[2].word}</h4>
              <h6>Guessed by: {this.state.answers[2].guesser}</h6>
              <h6>Submitted by: {this.state.answers[2].submitter}</h6>
            </div>
          }
          </Col>
        </Row>
      </React.Fragment>
    )
  }

  render () {
    if (this.props.phase === "Submission") {
      return (<React.Fragment>{this.renderSubmission()}</React.Fragment>);
    } else {
      return (<React.Fragment>{this.renderGuessing()}</React.Fragment>);
    }
  }

}

export default GuessingGame;
