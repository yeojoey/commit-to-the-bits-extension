import React, { Component } from 'react';

//Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';


import './GuessingGame.css';

class GuessingGame extends Component {

  constructor(props) {
    super(props)
    this.state = {
      mode: "Guessing",
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

  switchMode = () => {
    if (this.state.mode === "Guessing") {
      this.setState({mode: "Submission"});
    } else {
      this.setState({mode: "Guessing"})
    }
  }

  renderSubmission() {
    return (
      <React.Fragment>
        <div className="switch-tab"><Button onClick={() => this.switchMode()}>View guessed words</Button></div>
        <Row className="justify-content-md-center">
          <h5>SUBMIT A WORD BELOW</h5>
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
        <Row className="float-right"><div className="switch-tab"><Button onClick={() => this.switchMode()}>Submit new words</Button></div></Row>
        <Row className="justify-content-md-center mx-5">
          <h5>GUESS THE NOUN, VERB & LOCATION <b>IN CHAT!</b></h5>
        </Row>
        <Row className="justify-content-md-center mx-5">
          <Col className="col-sm margin-md">
          <div className="guess-box">
          <h6>Noun</h6>
          {
            this.props.answers[0].word === null ?
            <div>
              <h4>???</h4>
              <h6>Submitted by: ???</h6>
            </div>
            :
            <div>
              <h4>{this.props.answers[0].word}</h4>
              <h6>Guessed by: {this.props.answers[0].guesser}</h6>
              <h6>Submitted by: {this.props.answers[0].submitter}</h6>
            </div>
          }
          </div>
          </Col>
          <Col className="col-sm margin-md">
          <div className="guess-box">
          <h6>Verb</h6>
          {
            this.props.answers[1].word === null ?
            <div>
              <h4>???</h4>
              <h6>Submitted by: ???</h6>
            </div>
            :
            <div>
              <h4>{this.props.answers[1].word}</h4>
              <h6>Guessed by: {this.props.answers[1].guesser}</h6>
              <h6>Submitted by: {this.props.answers[0].submitter}</h6>
            </div>
          }
          </div>
          </Col>
          <Col className="col-sm margin-md">
          <div className="guess-box">
          <h6>Location</h6>
          {
            this.props.answers[2].word === null ?
            <div>
              <h4>???</h4>
              <h6>Submitted by: ???</h6>
            </div>
            :
            <div>
              <h4>{this.props.answers[2].word}</h4>
              <h6>Submitted by: {this.props.answers[2].submitter}</h6>
              <h6>Guessed by: {this.props.answers[2].guesser}</h6>
            </div>
          }
          </div>
          </Col>
        </Row>
      </React.Fragment>
    )
  }

  render () {
    return (
      <React.Fragment>
      {this.state.mode === "Guessing" ? this.renderGuessing() : this.renderSubmission() }
      </React.Fragment>
    )
  }

}

export default GuessingGame;
