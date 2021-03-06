import React from 'react';

export default class Register extends React.Component{
  constructor(props){
    super(props);
    this.state = {error: null};
  }

  register(username, password, repeat) {
    fetch('http://localhost:3000/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        repeat
      })
    })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        this.props.history.push('/');
      } else {
        this.setState({error: resp.error});
      }
    })
    .catch(err => {throw err;});
  }

  render(){
    let usernameField;
    let passwordField;
    let repeatPasswordField;
    return(
        <form>
            <h2> Register </h2>
            <p>{this.state.error}</p>
            <input ref={node => {usernameField=node;}} placeholder="Username" type="text" required="true" />
            <br />
            <input ref={node => {passwordField=node;}} placeholder="Password" type="password" required="true"/>
            <br />
            <input ref={node => {repeatPasswordField=node;}} placeholder="Confirm Password" type="password" required="true"/>
            <br />
            <button
            onClick={() => this.register(
              usernameField.value,
              passwordField.value,
              repeatPasswordField.value)}>
             Register
            </button>
            <button onClick={() => this.props.history.push('/')}>Login</button>
        </form>
    );
  }
}
