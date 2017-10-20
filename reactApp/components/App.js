import React from "react";
import { Switch, Route } from 'react-router-dom';
import MyEditor from "./Editor";
import Register from "./Register";
import Login from "./Login";
import DocumentsPortal from "./Documents";

export default class App extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div>
        <Switch>
          <Route exact path="/" component={Login}/>
          <Route exact path="/register" component={Register}/>
          <Route exact path="/docportal" component={DocumentsPortal}/>
          <Route exact path="/edit/:dochash" component={MyEditor}/>
          <Route path='/' render={() => <p>Invalid Page!</p>} />
        </Switch>
      </div>
    );
  }
}
