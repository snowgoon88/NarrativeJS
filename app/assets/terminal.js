// *****************************************************************************
// Terminal : a one-line pseudo terminal in DIV, with autocompletion popup
// *****************************************************************************
//
// Requires:
// - css file with proper .popup style.

// Cannot use KeyPress, as about to be deprecated
// Input Event is received after the DIV element and cannot intercept
// so, using compositionend Event to get composed characters and remove,
// afterwards, any inputed text to containterE

class Terminal {
    constructor( containerElement, infoElement ) {
        this.containerE = containerElement;
        this.infoE = infoElement;
        console.log( "TERM cont",this.containerE,"info",this.infoE );

        // create a popupDiv
        this.popupE = document.createElement( 'div' );
        this.popupE.classList.add( 'popup' );
        this.popupE.style.display = 'block';
        this.containerE.appendChild( this.popupE );
        // and some spans for before, cursor and after
        this.beforeE = document.createElement( 'span' );
        this.containerE.appendChild( this.beforeE );
        this.cursorE = document.createElement( 'span' );
        this.cursorE.classList.add( 'blinking_insert' );
        this.containerE.appendChild( this.cursorE );
        this.afterE = document.createElement( 'span' );
        this.containerE.appendChild( this.afterE );

        // and some internal values
        this.text = '';
        this.cursorPos = 0;
        this.hasChanged= false;

        this.cmdLine = new CommandLine();

        this.containerE.addEventListener( 'keydown',
                                          this.handleKeyDown.bind(this) );
        // detect end of composing character (but too late to prevent input)
        this.containerE.addEventListener( 'compositionend',
                                          this.handleInput.bind(this) );
                                          //true /* capture */);
        this.containerE.addEventListener( 'keyup',
                                          this.handleKeyUp.bind(this) );
    }
    /** Insert 'msg' at cursorPos */
    addText( msg ) {
        this.text = this.text.slice(0, this.cursorPos).concat(
            msg ).concat( this.text.slice( this.cursorPos ) );
        this.cursorPos += msg.length;
        this.ensureValidCursor();
        this.hasChanged = true;
    }
    /** Remove nbChar caracters at cursorPos
     * negative value means remove BEFORE cursorPos 
     */
    removeCharacters( nbChar ) {
        if (nbChar < 0) {
            this.text = this.text.slice( 0, this.cursorPos+nbChar).concat(
                this.text.slice( this.cursorPos ) );
            this.cursorPos += nbChar;
        }
        else {
            this.text = this.text.slice( 0, this.cursorPos).concat(
                this.text.slice( this.cursorPos+nbChar ) );
        }
        this.hasChanged = true;
        this.ensureValidCursor();
    }
    /** Move cursor, relative to current cursorPos */
    moveCursorRelative( depl ) {
        this.cursorPos += depl;
        this.hasChanged = true;
        this.ensureValidCursor();
    }
    /** 0 <= cursorPos <= text.length */ 
    ensureValidCursor() {
        if (this.cursorPos < 0) this.cursorPos = 0;
        if (this.cursorPos > this.text.length) this.cursorPos = this.text.length;
    }

    /** handle keydown (keypress is/will be deprecated)
     */
    handleKeyDown( event ) {
        console.log( "DOWN evt=", event );
        // unlike keypress, Shif+A generates 2 events...
        let key = event.key;
        
        if (key == "ArrowLeft" ) {
            this.moveCursorRelative( -1 );
        }
        else if (key == "ArrowRight" ) {
            this.moveCursorRelative( +1 );
        }
        else if (key == "Backspace" ) {
            this.removeCharacters( -1 );
        }
        else if (event.ctrlKey) {
            if (key == "a") {
                this.moveCursorRelative( -this.cursorPos );
            }
            else if (key == "e") {
                this.moveCursorRelative( this.text.length );
            }
            else if (key == "k") {
                this.removeCharacters( this.text.length );
            }
        }
        else if (key == "Tab") {
            let completion = this.cmdLine.currentToken.validActualCompletion();
            console.log( "TO INSERT",completion );
            this.removeCharacters( -completion.pattern.length );
            this.addText( completion.text );
        }
        else if (key == "ArrowUp") {
            this.cmdLine.currentToken.moveSelection( -1 );
        }
        else if (key == "ArrowDown") {
            this.cmdLine.currentToken.moveSelection( +1 );
        }
        else if (["Dead", "Compose", "Process", "Control"].includes( key) ) {
            //console.log( "STOP" );
        }
        else if (key != "Shift") {
            this.addText( key );
        }
        //console.log( "TERM =", this.text, "/", this.cursorPos );
        //this.updateHTML();
        //this.updatePopup();

        // prevent key event from going elsewhere
        event.preventDefault();
    }
    handleBeforeInput( event ) {
        console.log( "BEFORE evt=", event );
        //this.addText( event.data );
        //event.preventDefault();
    }
    handleInput( event ) {
        // If some Input event pass through, they are added as #text
        // as the first child of this.containerE
        // so, we remove them.
        // console.log( "INPUT evt=", event.target.innerHTML, event );

        // add composed char to our own text
        this.addText( event.data );

        // but remove it from the automatically added #text as first child
        let child = this.containerE.firstChild;
        //console.log( "->remove ",child);
        this.containerE.removeChild(child);
        
        event.preventDefault();
    }
    handleKeyUp( event ) {
        // console.log( "UP evt=", event );
        // console.log( "  this=", this.text, "/", this.cursorPos );

        if (this.hasChanged) {
            this.cmdLine.update( this.text, this.cursorPos );

            this.hasChanged = false;
        }

        this.updateHTML();

        this.popupE.innerHTML = '';
        this.cmdLine.updatePopup( this.popupE );
        this.updatePopupPosition();

        if (this.infoE) {
            this.infoE.innerHTML = '';
            this.cmdLine.updateInfo( this.infoE );
        }
    }
    /** Update terminal Element 
     * Erase beforeE, cursorE and afterE 
     * set their new innerHTML
     */
    updateHTML() {
        // Erase actual content
        this.beforeE.innerHTML = '';
        this.cursorE.innerHTML = '';
        this.afterE.innerHTML = '';
        // while (elem.firstChild) {
        //     elem.removeChild( elem.lastChild );
        // }

        // neutral span start -> cursor
        this.beforeE.innerHTML = this.htmlize(this.text.slice( 0, this.cursorPos ));

        // blinkingBack at cursor
        if (this.cursorPos >= this.text.length) {
            this.cursorE.innerHTML = this.htmlize( ' ');//'&nbsp;';
        }
        else {
            this.cursorE.innerHTML = this.htmlize(this.text.substr( this.cursorPos, 1));
        }

        // neutral span cursor -> end
        this.afterE.innerHTML = this.htmlize(this.text.slice( this.cursorPos+1 ));
    }

    /** get coordinates in pixels of the cursor
     * 1) look for containerE borderLeft and Top
     * 2) use cursorE own offset relative to containerE
     *
     * WARN : containerE must not be position:static, 
     *        and popupE must be position:absolute
     */
    getCaretCoordinates() {
        // find some properties of containerE
        let computed = window.getComputedStyle( this.containerE );

         let coordinates = {
            top: this.cursorE.offsetTop + parseInt(computed['borderTopWidth']),
            left: this.cursorE.offsetLeft + parseInt(computed['borderLeftWidth']),
            width: this.cursorE.offsetWidth,
            height: this.cursorE.offsetHeight
        };
        return coordinates;
    }

    /** update popupE position
     * BASIC : display carret position
     */
    updatePopupPosition() {
        let coord = this.getCaretCoordinates();
        this.popupE.style.left = coord.left + coord.width + 'px';
	this.popupE.style.top = coord.top + coord.height + 'px';
    }
    updatePopup() {
        let coord = this.getCaretCoordinates();
        this.popupE.innerHTML = "caret at "+coord.left+" x "+coord.top+" ["+coord.width+" x "+coord.height+"]";
        this.popupE.style.left = coord.left + coord.width + 'px';
	this.popupE.style.top = coord.top + coord.height + 'px';
    }
    updateInfoWithElement( elem ) {
        this.infoE.appendChild( elem );
    }
    /*
     * Replace ' ' with &nbsp
     */
    htmlize( text ) {
        return text.replace( / /g, '&nbsp;' );
    }
}


console.log( "**** Test regexp *******************************" );
let testStr = [ '$bouh ', '$bo ou ', '$! ', 'all ', '$bééé ' ];
let regValid = /^\s*\$\S*\s$/g;
let res;
for( let i=0; i<testStr.length; i++) {
    res = testStr[i].match( regValid );
    console.log( testStr[i],"=>",res);
    res = regValid.test( testStr[i] );
    console.log( testStr[i],"=>",res);
}
