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
      suggestion: ""
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      suggestion: event.target.value
    })
  }

  handleVote(i) {
    this.props.handleVoteSubmit(i);
  }

  handleCategoryChange(category) {
    this.setState({selectedCategory: category});
  }

  handleSubmit = async () => {
    const response = await fetch ("/api/submitSuggestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": this.props.authToken,
        "suggestion": this.state.suggestion,
        "category": this.state.category
      }
    });
    const body = await response.json();
    console.log("Submitted");
    this.state.suggestion = "";
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
          <h5>{this.props.finalWord}</h5>
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
            <Button as={InputGroup.Append} onClick={() => this.props.handleSubmit()}>Submit</Button>
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
