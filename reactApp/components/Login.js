import React from 'react';

export default class Login extends React.Component{
  constructor(props){
    super(props);
    this.state = {error: null};
  }

  login(username, password) {
    fetch('http://localhost:3000/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      })
    })
    .then(resp => resp.status === 401 ? resp.text() : resp.json())
    .then(result => {
      if (result === 'Unauthorized') {
        this.setState({error: 'Incorrect Username or Password'});
      } else {
        this.props.history.push('/docportal');
      }
    })
    .catch(err => {throw err;});
  }

  render(){
    let usernameField;
    let passwordField;
    return(
    <form>
        <h2> Login:</h2>
        <h4>{this.state.error}</h4>
        <input ref={node => {usernameField=node;}} placeholder="Username" type="text" />
        <br />
        <input ref={node => {passwordField=node;}} placeholder="Password" type="password" />
        <br />
        <button onClick={() => this.login(usernameField.value,passwordField.value)}>
         Login
        </button>
        <button onClick={() => this.props.history.push('/register')}>Register</button>
    </form>
    );
  }
}
