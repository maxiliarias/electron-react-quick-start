import React from "react";
import {Editor, EditorState, Modifier, RichUtils, convertToRaw, convertFromRaw} from 'draft-js';
import debounce from 'lodash/debounce';

export default class MyEditor extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      title: "Loading ..."
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => {
      const contentState = editorState.getCurrentContent();
      console.log('in onChange', convertToRaw(contentState));
      this.saveContent(contentState);
      this.setState({editorState});
    };

    this.toggleColor = (toggledColor) => this._toggleColor(toggledColor);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
  }

  saveContent(content){
    const docId = this.props.match.params.dochash;
    fetch(`http://localhost:3000/content?id=${docId}`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        content: convertToRaw(content)
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        console.log('successful save');
      } else {
        throw resp.error;
      }
    })
    .catch(err => { throw err; });
  }

  componentDidMount() {
    const docId = this.props.match.params.dochash;

    fetch(`http://localhost:3000/getdocument?id=${docId}`, {
      credentials: 'include'
    })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        console.log('got to rawContent', resp.doc);
        const raw = resp.doc.content;
        if(raw){
          console.log('state is', raw);
          const contentState = convertFromRaw(JSON.parse(raw));
          console.log('contentState is', contentState);
          this.setState({
            editorState: EditorState.createWithContent(contentState),
            title: resp.doc.title
          });

        } else {
          console.log('instead state is', this.state.title);
          this.setState({
            title: resp.doc.title
          });
        }

      } else {
        this.setState({ error: resp.error.errmsg});
      }
    })
    .catch(err => { throw err;});
  }

  _onBoldClick(){
    this.onChange(RichUtils.toggleInlineStyle(
      this.state.editorState,
      'BOLD'
    ));
  }
  _onItalicsClick(){
    this.onChange(RichUtils.toggleInlineStyle(
      this.state.editorState,
      'ITALIC'
    ));
  }
  _onUnderlineClick(){
    this.onChange(RichUtils.toggleInlineStyle(
      this.state.editorState,
      'UNDERLINE'
    ));
  }
  _onStrikeClick(){
    this.onChange(RichUtils.toggleInlineStyle(
      this.state.editorState,
      'STRIKETHROUGH'
    ));
  }
  _toggleColor(toggledColor) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();

    // Let's just allow one color at a time. Turn off all active colors.
    const nextContentState = Object.keys(colorStyleMap)
      .reduce((contentState, color) => {
        return Modifier.removeInlineStyle(contentState, selection, color);
      }, editorState.getCurrentContent());

    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    );

    const currentStyle = editorState.getCurrentInlineStyle();
    // Unset style override for current color.
    if (selection.isCollapsed()) {
      nextEditorState = currentStyle.reduce((state, color) => {
        return RichUtils.toggleInlineStyle(state, color);
      }, nextEditorState);
    }
    // If the color is being toggled on, apply it.
    if (!currentStyle.has(toggledColor)) {
      nextEditorState = RichUtils.toggleInlineStyle(
        nextEditorState,
        toggledColor
      );
    }
    this.onChange(nextEditorState);
  }
  _toggleBulletPoints(){
    this.onChange(RichUtils.toggleBlockType(
         this.state.editorState,
         'unordered-list-item'
    ));
  }
  _toggleNumberPoints(){
    this.onChange(RichUtils.toggleBlockType(
         this.state.editorState,
         'ordered-list-item'
    ));
  }
  _onAlignCenter(){
    this.onChange(RichUtils.toggleBlockType(
      this.state.editorState,
      'right'
    ));
  }
  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  render(){
    const {editorState} = this.state;
    if (!this.state.editorState) {
      return (
     <h3 className="loading">Loading...</h3>
      );
    }
    return (
      <div style={styles.root}>
          <button onClick={() => {this.props.history.push('/docportal');}}>{'<'}Back to Document Portal</button>
          <br />
          <h1>{this.state.title}</h1>
          <h4>Shareable Document ID: {this.props.match.params.dochash} </h4>
          <BlockStyleControls editorState={editorState} onToggle={this.toggleBlockType}/>
          <ColorControls editorState={editorState} onToggle={this.toggleColor}/>
          <button onClick={this._onBoldClick.bind(this)} style={styles.styleButton}>Bold</button>
          <button onClick={this._onItalicsClick.bind(this)} style={styles.styleButton}>Italics</button>
          <button onClick={this._onUnderlineClick.bind(this)} style={styles.styleButton}>Underline</button>
          <button onClick={this._onStrikeClick.bind(this)} style={styles.styleButton}>Strike-Through</button>
          <button onClick={this._toggleBulletPoints.bind(this)} style={styles.styleButton}>Bullet</button>
          <button onClick={this._toggleNumberPoints.bind(this)} style={styles.styleButton}>Numbers</button>
          <button onClick={this._onAlignCenter.bind(this)} style={styles.styleButton}>Align Center</button>
          <div style={styles.editor} onClick={this.focus}>
              <Editor
                customStyleMap={colorStyleMap}
                editorState = {this.state.editorState}
                onChange = {this.onChange}
                placeholder="Write something ..."
                ref="editor"
                textAlignment= "center"
              />
          </div>
      </div>
    );
  }
}

class StyleButton extends React.Component {
  constructor(props) {
    super(props);
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }
  render() {
    let style;
    if (this.props.active) {
      style = Object.assign({}, styles.styleButton, colorStyleMap[this.props.style]);
    } else {
      style = styles.styleButton;
    }
    return (
     <span style={style} onMouseDown={this.onToggle}>
       {this.props.label}
     </span>
    );
  }
}

const BLOCK_TYPES = [
        {label: 'H1', style: 'header-one'},
        {label: 'H2', style: 'header-two'},
        {label: 'H3', style: 'header-three'},
        {label: 'H4', style: 'header-four'},
        {label: 'H5', style: 'header-five'},
        {label: 'H6', style: 'header-six'},
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();

  return (
      <div className="RichEditor-controls">
        {BLOCK_TYPES.map((type) =>
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
      </div>
  );
};


var COLORS = [
 {label: 'Red', style: 'red'},
 {label: 'Orange', style: 'orange'},
 {label: 'Yellow', style: 'yellow'},
 {label: 'Green', style: 'green'},
 {label: 'Blue', style: 'blue'},
 {label: 'Indigo', style: 'indigo'},
 {label: 'Violet', style: 'violet'},
];
const ColorControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
   <div style={styles.controls}>
     {COLORS.map(type =>
       <StyleButton
         active={currentStyle.has(type.style)}
         label={type.label}
         onToggle={props.onToggle}
         style={type.style}
       />
     )}
   </div>
  );
};
   // This object provides the styling information for our custom color
   // styles.
const colorStyleMap = {
  red: {
    color: 'rgba(255, 0, 0, 1.0)',
  },
  orange: {
    color: 'rgba(255, 127, 0, 1.0)',
  },
  yellow: {
    color: 'rgba(180, 180, 0, 1.0)',
  },
  green: {
    color: 'rgba(0, 180, 0, 1.0)',
  },
  blue: {
    color: 'rgba(0, 0, 255, 1.0)',
  },
  indigo: {
    color: 'rgba(75, 0, 130, 1.0)',
  },
  violet: {
    color: 'rgba(127, 0, 255, 1.0)',
  },
};
const styles = {
  root: {
    fontFamily: '\'Georgia\', serif',
    fontSize: 14,
    padding: 20,
    width: 600,
  },
  editor: {
    borderTop: '1px solid #ddd',
    cursor: 'text',
    fontSize: 16,
    marginTop: 20,
    minHeight: 400,
    paddingTop: 20,
  },
  controls: {
    fontFamily: '\'Helvetica\', sans-serif',
    fontSize: 14,
    marginBottom: 10,
    userSelect: 'none',
  },
  styleButton: {
    color: '#999',
    cursor: 'pointer',
    marginRight: 16,
    marginTop: 5,
    padding: '2px 0',
  }
};
