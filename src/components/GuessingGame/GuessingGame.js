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

  submitWord = async (type, word, event) => {
    if (word === "") {
      return;
    }
    const response = await fetch ("/api/submitWord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken,
        "word": word,
        "type": type
      }
    });
    const body = await response.json();
    switch (type) {
      case "noun":
        this.state.nounSubmission = "";
        break;

      case "verb":
        this.state.verbSubmission = "";
        break;

        default:
      case "location":
        this.state.locationSubmission = "";
        break;
    }
  }

  handleChange =  (type, e) => {
    console.log("Word type: " + type);
    if (type === "noun") {
      this.setState({
        nounSubmission: e.target.value
      })
    } else if (type === "verb") {
      this.setState({
        verbSubmission: e.target.value
      })
    } else {
      this.setState({
        locationSubmission: e.target.value
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
            <FormControl placeholder="e.g. fisherman" value={this.state.nounSubmission} onChange={(e) => this.handleChange("noun", e)}/>
            <Button as={InputGroup.Append} onClick={(e) => this.submitWord("noun", this.state.nounSubmission, e)} >Submit</Button>
          </InputGroup>
          </Col>
          <Col className="col-sm">
          <h6>Verb</h6>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. driving" value={this.state.verbSubmission} onChange={(e) => this.handleChange("verb", e)}/>
            <Button as={InputGroup.Append} onClick={(e) => this.submitWord("verb", this.state.verbSubmission, e)}>Submit</Button>
          </InputGroup>
          </Col>
          <Col className="col-sm">
          <h6>Location</h6>
          <InputGroup className="mx-auto" style={{"max-width": "250px"}}>
            <FormControl placeholder="e.g. classroom" value={this.state.locationSubmission} onChange={(e) => this.handleChange("location", e)}/>
            <Button as={InputGroup.Append} onClick={(e) => this.submitWord("location", this.state.locationSubmission, e)}>Submit</Button>
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
