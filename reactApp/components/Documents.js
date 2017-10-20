import React from "react";
import { Link } from 'react-router-dom';

export default class DocumentsPortal extends React.Component{
  constructor(props){
    super(props);

    this.state = {userDocs: [], error: null};
  }

  loadDocs(){
    fetch('http://localhost:3000/getdocuments', {
      credentials: 'include'
    })
    .then(resp => resp.json())
    .then(resp => {
      if(resp.success){
        this.setState({userDocs: resp.userDocs, error: null});
      } else {
        this.setState({error: resp.error.errmsg});
      }
    })
    .catch(err => {throw err;});
  }

  componentDidMount(){
    this.loadDocs();
  }

  newDoc(title){
    fetch('http://localhost:3000/newdocument', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title
      })
    })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        console.log('inside success of new doc');
        this.setState({ userDocs: this.state.userDocs.concat(resp.doc), error: null });
      } else {
        this.setState({error: resp.error.errmsg});
      }
    })
    .catch(err => {throw err;});
  }

  render(){
    let docTitle;
    return(
      <div>
      <button onClick={() => this.props.history.push('/')}>Log out</button>
      <button onClick={() => this.props.history.push('/edit')}>MyEditor </button>
      <h1> Document Portal </h1>
      <input ref={node => {docTitle=node;}} placeholder="New Document Title" type="text"/>
      <button onClick={() => {this.newDoc(docTitle.value);}}>Create</button>
      <div style={{outline: 'solid', padding: 10, margin: 10}}>
        <label>My Documents</label>
        <div>
          {this.state.userDocs.map(doc => <div key={doc._id}><Link to={`/edit/${doc._id}`}>{doc.title}</Link></div>)}
        </div>
      </div>
      </div>
    );
  }
}
