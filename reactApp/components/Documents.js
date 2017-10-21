import React from "react";
import { Link } from 'react-router-dom';
import Modal from 'react-modal';

export default class DocumentsPortal extends React.Component{
  constructor(props){
    super(props);

    this.state = {userDocs: [], error: null, modalIsOpen: false, modalError: null};
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  loadDocs(){
    fetch('http://localhost:3000/getdocuments', {
      credentials: 'include'
    })
    .then(resp => resp.json())
    .then(resp => {
      if(resp.success){
        this.setState({userDocs: resp.userDocs, error: null});
        console.log('inside of success for fetching docs');
      } else {
        this.setState({error: resp.error.errmsg});
        console.log('inside of failed fetching docs');
      }
    })
    .catch(err => {throw err;});
  }

  componentDidMount(){
    this.loadDocs();
  }

  newDoc(title,password){
    fetch('http://localhost:3000/newdocument', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        password
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

  /* Modal Configuring */
  openModal() {this.setState({modalIsOpen: true, modalError: null});}
  closeModal() {this.setState({modalIsOpen: false});}
  checkPassword(id, password){
    fetch('http://localhost:3000/checkpassword',{
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        password
      })
    })
    .then(resp => resp.json())
    .then(resp => {
      if(resp.success){
        this.props.history.push(`/edit/${id}`);
      } else {
        this.setState({modalError: resp.error});
      }
    });
  }

  render(){
    let docTitle;
    let docPassword;
    let password;
    return(
      <div>
      <button onClick={() => this.props.history.push('/')}>Log out</button>
      <button onClick={() => this.props.history.push('/edit')}>MyEditor </button>
      <h1> Document Portal </h1>
      <p>{this.state.error}</p>
      <form>
        <input ref={node => {docTitle=node;}} placeholder="New Document Title" type="text" required="true" />
        <input ref={node => {docPassword=node;}} placeholder="Create a password" type="password" required="true" />
        <button onClick={() => {this.newDoc(docTitle.value, docPassword.value);}}>Create Document</button>
      </form>
      <div style={{outline: 'solid', padding: 10, margin: 10}}>
        <label>My Documents</label>
        <div>
          {this.state.userDocs.map(doc =>
            <div key={doc._id}>
              <button onClick={this.openModal}>{doc.title}</button>
              <Modal
                isOpen={this.state.modalIsOpen}
                onRequestClose={this.closeModal}
                contentLabel="Modal"
               >
                <h3>Please enter password for document: {doc._id} </h3>
                <button onClick={this.closeModal}>Close</button>
                <p>{this.state.modalError}</p>
                <input ref={node => {password=node;}} placeholder="Password" type="password" required="true" />
                <button onClick={() => this.checkPassword(doc._id,password.value)}>Submit</button>
               </Modal>
            </div>)}
        </div>

      </div>
      </div>
    );
  }
}
