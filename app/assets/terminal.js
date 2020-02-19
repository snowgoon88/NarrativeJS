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
    constructor( containerElement ) {
        this.containerE = containerElement;

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
    }
    /** Remove nbChar caracters at cursorPos
     * negative value means remove BEFORE cursorPos 
     */
    removeCharacters( nbChar ) {
        this.text = this.text.slice( 0, this.cursorPos+nbChar).concat(
            this.text.slice( this.cursorPos ) );
        this.cursorPos += nbChar;
        this.ensureValidCursor();
    }
    /** Move cursor, relative to current cursorPos */
    moveCursorRelative( depl ) {
        this.cursorPos += depl;
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
        //console.log( "DOWN evt=", event );
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
        else if (["Dead", "Compose", "Process"].includes( key) ) {
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
        this.updateHTML();
        this.updatePopup();
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
    updatePopup() {
        let coord = this.getCaretCoordinates();
        this.popupE.innerHTML = "caret at "+coord.left+" x "+coord.top+" ["+coord.width+" x "+coord.height+"]";
        this.popupE.style.left = coord.left + coord.width + 'px';
	this.popupE.style.top = coord.top + coord.height + 'px';
    }
    /*
     * Replace ' ' with &nbsp
     */
    htmlize( text ) {
        return text.replace( / /g, '&nbsp;' );
    }
}
