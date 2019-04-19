import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';

class Instructions extends Component {

  constructor(props) {
    super(props);
  }

  render () {

    return (
      <Modal.Dialog>
        <Modal.Header closeButton onClick={this.toggleInstructions}>
          <Modal.Title>Instructions</Modal.Title>
        </Modal.Header>
        { this.props.currentGame === "FreezeTag" ?
        <Modal.Body>
          <p>In Freeze Tag, 2 performers act out a scene.  At a certain point, the host or other performers
          will shout out "Freeze!" and the performers stop moving.  A new performer gets a suggestion from the
          audience, then taps on one of the frozen performers and takes their place.  The scene then starts
          again with the new performer tying their suggestion into the story.</p>

          <p>Guests interact by typing in the suggestion box below to suggest characters, relationships, objectives, and locations.
          For example, a Character suggestion would look like "a superhero".</p>

          <p>Vote on your favorite suggestion by clicking the corresponding button on the screen.</p>
        </Modal.Body>
        :
        this.props.currentGame === "TSA" ?
        <Modal.Body>
          <p>In TSA, audience members submit drawings of the contents of a traveller's bag.  One performer as a TSA
          Agent will interrogate the traveller as they try to justify increasingly random security X-Rays.</p>

          <p>You will be submitting these pictures.  Please open up MS Paint and draw whatever comes to mind.  Submit
          it by simply dropping it in this <a href="https://drive.google.com/drive/folders/1LbIjPZp2xjq_AsMxN_QjfNWH3wA832aY?usp=sharing" target="_blank">Google
          Drive folder</a>.</p>

          <p>Have fun making this traveller's day more difficult!</p>
        </Modal.Body>
        : this.props.currentGame === "Courtroom" ?
        <Modal.Body>
          <p>In Discord in the Court, performers and audience members work together to create a scene.  One performer
          takes on the role of a prosecutor while the other is a defendant.  The prosecutor is trying to convince the
          judge that the defendant is guilty and does so by bringing in witnesses.</p>

          <p>Witnesses are pulled from the audience from a queue and are given a role by the prosecutor (e.g. “Next
            we’ll hear from the owner of the shop where the crime took place.”)  Witnesses give improvised statements.
            These statements should be completely random and have no (or little) connection to previous statements.
            The defendant takes those statements and tries to explain why they did so, making up their crime in the
             process.</p>

          <p>To play, audience members should enter their Discord user name into the box on the overlay.</p>
        </Modal.Body>
        : this.props.currentGame === "Music" ?
        <Modal.Body>
          <p>In Music to my Peers, performers act out a scene based on a suggestion from the audience.  At some point
          in the scene, an audience member will be selected to be the DJ.  The DJ gets to pick several songs that will
          play during the scene, changing the mood of the performers and the overall feel of the scene. </p>

          <p>If you’d like to be the DJ, just click the “Pick Me” button and you’ll be added to the list!  DJs are selected
          randomly from the list.  Once you’re the DJ, you can pick three songs by clicking the buttons with song genres.
           Once the scene ends, a new DJ will be picked and a new scene will start. </p>
        </Modal.Body>
        :
        <Modal.Body>
          <p>In Guesstination Unknown, audience members can input three suggestions - a noun, a verb, and a location.
          One of each of these is picked to create a scenario (like “The Joker washing a goat in Paris), but the audience
          doesn’t know what that final scenario is.  A single improv performer will go on stage and perform a scene based
          on that scenario.  The audience must guess the three suggestions based on what they see.</p>

          <p>Suggestions are input on the overlay while guesses are done <b>through chat.</b></p>
        </Modal.Body>
        }
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.toggleInstructions}>Close</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )

  }

}

export default Instructions
