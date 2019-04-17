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
  }

  submitWord = async (event) => {
    // Submission phase
    if (this.props.phase === "Submission") {
      console.log(event.target.wordType);
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
          <h6>Noun</h6>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. fisherman" wordType="noun" value={this.state.nounSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} wordType="noun" onClick={() => this.submitWord()} >Submit</Button>
          </InputGroup>
          </Col>
          <Col>
          <h6>Verb</h6>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. driving" wordType="verb" value={this.state.verbSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} wordType="verb" onClick={() => this.submitWord()}>Submit</Button>
          </InputGroup>
          </Col>
          <Col>
          <h6>Location</h6>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. classroom" wordType="location"  value={this.state.locationSubmission} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} wordType="location" onClick={() => this.submitWord()}>Submit</Button>
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
          <Col>
          <h6>Noun</h6>
          {
            this.props.answers[0].word === null ?
            <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
              <FormControl placeholder="e.g. fisherman" wordType="noun" value={this.state.nounSubmission} onChange={this.handleChange}/>
              <Button as={InputGroup.Append} wordType="noun" onClick={() => this.submitNoun()} >Submit</Button>
            </InputGroup>
            :
            <div>
              <h4>{this.props.answers[0].word}</h4>
              <h6>Guessed by: {this.props.answers[0].guesser}</h6>
              <h6>Submitted by: {this.props.answers[0].submitter}</h6>
            </div>
          }

          </Col>
          <Col>
          <h6>Verb</h6>
          {
            this.props.answers[1].word === null ?
            <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
              <FormControl placeholder="e.g. driving" wordType="verb" value={this.state.verbSubmission} onChange={this.handleChange}/>
              <Button as={InputGroup.Append} wordType="verb" onClick={() => this.submitVerb()}>Submit</Button>
            </InputGroup>
            :
            <div>
              <h4>{this.props.answers[1].word}</h4>
              <h6>Guessed by: {this.props.answers[1].guesser}</h6>
              <h6>Submitted by: {this.props.answers[0].submitter}</h6>
            </div>
          }
          </Col>
          <Col>
          <h6>Location</h6>
          {
            this.props.answers[2].word === null ?
            <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
              <FormControl placeholder="e.g. classroom" wordType="location"  value={this.state.locationSubmission} onChange={this.handleChange}/>
              <Button as={InputGroup.Append} wordType="location" onClick={() => this.submitLocation()}>Submit</Button>
            </InputGroup>
            :
            <div>
              <h4>{this.props.answers[2].word}</h4>
              <h6>Guessed by: {this.props.answers[2].guesser}</h6>
              <h6>Submitted by: {this.props.answers[2].submitter}</h6>
            </div>
          }
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
        {this.renderGuessing()}
        </React.Fragment>
      )
      //return (null)
    }
  }

}

export default GuessingGame;
