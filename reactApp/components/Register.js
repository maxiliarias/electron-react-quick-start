import React from 'react';

export default class Register extends React.Component{
  constructor(props){
    super(props);
    this.state = {username: ''};
  }

  register(username, password, repeat, fname, lname) {
    fetch('http://localhost:3000/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        fname,
        lname
      })
    })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        this.props.history.push('/');
      } else {
        this.setState({error: resp.error.errmsg});
      }
    })
    .catch(err => {throw err;});
  }

  render(){
    let usernameField;
    let passwordField;
    let repeatPasswordField;
    let fnameField;
    let lnameField;
    return(
        <form>
            <h2> Register </h2>
            <input ref={node => {usernameField=node;}} placeholder="Username" type="text" />
            <br />
            <input ref={node => {passwordField=node;}} placeholder="Password" type="password" />
            <br />
            <input ref={node => {repeatPasswordField=node;}} placeholder="Confirm Password" type="password" />
            <br />
            <input ref={node => {fnameField=node;}} placeholder="First Name" type="text" />
            <br />
            <input ref={node => {lnameField=node;}} placeholder="Last Name" type="text" />
            <br />
            <button
            onClick={() => this.register(
              usernameField.value,
              passwordField.value,
              repeatPasswordField.value,
              fnameField.value,
              lnameField.value)}>
             Register
            </button>
            <button onClick={() => this.props.history.push('/')}>Login</button>
        </form>
    );
  }
}
