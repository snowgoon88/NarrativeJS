// React Console Component
//

class ConsoleComp extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {
            value: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    handleChange( event ) {
        console.log( "CHANGE val=", event.target.value,
                     " sel=",event.target.selectionStart,"/",event.target.selectionEnd
        );
        
        this.setState( { value: event.target.value } );
        //event.preventDefault();
    }
    handleInput( event ) {
        console.log( "INPUT val=", event.target.value,
                     " sel=",event.target.selectionStart,"/",event.target.selectionEnd
        );
    }
    handleSubmit( event ) {
        console.log( "SUBMIT val=", event.target.value,
                     " sel=",event.target.selectionStart,"/",event.target.selectionEnd
        );
    }

    handleKeyDown( event ) {
        console.log( "K_DOWN char=", event.charcode,
                     " key=",event.key, " keyCode=",event.keyCode,
                     " shift=",event.shiftKey, " ctrl=", event.ctrlKey,
                     " alt=", event.altKey 
        );
        if (event.key == "Tab") {
            console.log( " -> Tab prevented" );
            event.preventDefault();
        }
    }
    handleKeyPress( event ) {
        console.log( "K_PRESS char=", event.charcode,
                     " key=",event.key, " keyCode=",event.keyCode,
                     " shift=",event.shiftKey, " ctrl=", event.ctrlKey,
                     " alt=", event.altKey 
        );
    }
    handleKeyUp( event ) {
        console.log( "K_UP char=",  event.charcode,
                     " key=",event.key, " keyCode=",event.keyCode,
                     " shift=",event.shiftKey, " ctrl=", event.ctrlKey,
                     " alt=", event.altKey 
        );
    }
    
    render() {
        return (
            <textarea
            className="input_area"
            value={this.state.value}
            onChange={this.handleChange}
            onInput={this.handleInput}
            onSubmit={this.handleSubmit}

            onKeyDown={this.handleKeyDown}
            onKeyPress={this.handleKeyPress}
            onKeyUp={this.handleKeyUp}
            />
        );
    }
}


// *****************************************************************************
// ************************************************************************ test
// *****************************************************************************
const consoleReact = <ConsoleComp/>;

ReactDOM.render(
    consoleReact,
    document.getElementById( 'react_root' )
);
