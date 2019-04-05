import React, { Component } from 'react';

// Styling
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';

class FreezeTag extends Component {

  categories = ["Character", "Relationship", "Objective", "Location"];

  constructor(props) {
    super(props)
    this.state = {
      selectedCategory: "Character",
      suggestion: "",
      placeholder: "e.g. a teacher"
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      suggestion: event.target.value
    })
  }

  handleVote = async (vote) => {
      const response = await fetch ("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": this.props.authToken,
          "vote": vote
        },
      });
      const body = await response.json();
      this.setState(body);
      this.setState({votedBefore: true});
  }

  handleCategoryChange(category) {
    console.log("changing to "+category);
    var placeholder = "";
    switch (category) {

      case "Relationship":
      placeholder = "e.g. best friends"
      break;

      case "Objective":
      placeholder = "e.g. to make money"
      break;

      case "Location":
      placeholder = "e.g. hospital"
      break;

      default:
      case "Character":
        placeholder = "e.g. teacher";
        break;

    }
    this.setState({selectedCategory: category, suggestion: "", placeholder: placeholder});
  }

  handleSubmit = async () => {
    const response = await fetch ("/api/submitSuggestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken,
        "suggestion": this.state.suggestion,
        "category": this.state.selectedCategory
      }
    });
    const body = await response.json();
    this.setState({ suggestion: "" });
  }


  renderDropdownItems() {
    let result = [];
    this.categories.forEach((category) => {
      if (this.state.selectedCategory !== category) {
        result.push(<Dropdown.Item value={category} onClick={() => this.handleCategoryChange(category)}>{category}</Dropdown.Item>)
      }
    });
    return result;
  }

  renderVoting() {
    if (this.props.isVoting) {
      return (
        <div>
        {this.props.votedBefore ?
          <h6>Thanks for voting!</h6> :
          <div>
            <h6>Vote on a suggestion:</h6>
            <Button onClick={() => this.handleVote(0)}> {this.props.options ? this.props.options[0] : "test1"} </Button>{' '}
            <Button onClick={() => this.handleVote(1)}> {this.props.options ? this.props.options[1] : "test2"} </Button>{' '}
            <Button onClick={() => this.handleVote(2)}> {this.props.options ? this.props.options[2] : "test3"} </Button>{' '}
            <Button onClick={() => this.handleVote(3)}> {this.props.options ? this.props.options[3] : "test4"} </Button>
          </div>
        }
        </div>
      )
    } else {
      return;
    }
  }

  render() {
    return(
      <React.Fragment>
      <Row className="justify-content-md-center mx-5">
      <Col>
        <div>
          <h6>Current Prompt:</h6>
          <h5>{this.props.finalWord === "" ? "No prompt yet" : this.props.finalWord}</h5>
        </div>
        <div>
          <h6>Make a submission</h6>
          <InputGroup className="mx-auto" style={{"max-width": "600px"}}>
            <DropdownButton
              as={InputGroup.Prepend}
              variant="outline-secondary"
              title={this.state.selectedCategory}>
              {this.renderDropdownItems()}
            </DropdownButton>
            <FormControl placeholder="Suggestion" value={this.state.suggestion} onChange={this.handleChange}/>
            <Button as={InputGroup.Append} onClick={() => this.handleSubmit()}>Submit</Button>
          </InputGroup>
          {this.renderVoting()}
        </div>
        </Col>
      </Row>
      </React.Fragment>
    )
  }
}

export default FreezeTag
