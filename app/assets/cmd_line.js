// *****************************************************************************
// cmdline begin with an OBJECT
// OBJECT = selection ($xxx) or person (or relation)
//
// NEEDED : every pattern must start with a ONE CHAR Marker ($,",' ',...)
// TODO: could know the ending positin of previons command TOKEN
//
// Require : 
// - utils.js (for regExpEscape )

var _caseSensitive = false;

var selections = ['all', 'persones', 'relations'];
var persons = [ 'KABUKI René', 'KABUKI Jo', 'BUSHI Paul', 'KI van dam' ];
var actions = [ 'add', 'list', 'show', 'remove', 'supprim' ];

var objectPatterns = [
    {
        name: "selection",
        marker: '$',
        closing: ' ',
        candidates: function() { return selections; },
        enclosing: {start:'$', end:' '}
    },
    {
        name: "person",
        marker: '"',
        closing: '" ',
        candidates: function() { return persons; },
        enclosing: {start:'"', end:'" '}
    }
];
var actionPatterns = [
    {
        name: "action",
        marker: ' ',
        closing: ' ',
        candidates: function() { return actions; },
        enclosing: {start:' ', end:' '}
    }
];

// when completed, will represent an OBJECT
class ObjectToken {
    constructor( label, patternTypes ) {
        this.label = label;
        this.patternTypes = patternTypes;
        this.token = {valid:false, from:-1, to:-1};

        this.resetPattern();
    }

    lookForPatternMatches( pattern, type ) {
        // regexp search pattern, case sensitive
        let flagSearch = _caseSensitive ? "" : "i" ;
        let regpat = RegExp( regExpEscape(pattern), flagSearch );
        let regpat_start = RegExp( "^"+regExpEscape(pattern), flagSearch );

        let tmpStart = [];
        let tmpOther = [];

        let allCandidates = type.candidates();
        for( let ip=0; ip<allCandidates.length; ip++) {
            
            if (regpat_start.test( allCandidates[ip])) {
                tmpStart.push( {
                    cmd: allCandidates[ip],
                    pattern: pattern,
                    type: type
                });
            }
            else if (regpat.test( allCandidates[ip])) {
                tmpOther.push( {
                    cmd: allCandidates[ip],
                    pattern: pattern,
                    type: type
                });
            }
        }
        this.startMatches = tmpStart;
        this.otherMatches = tmpOther;

        // if some matches, set selection index to 0
        if (this.startMatches.length + this.otherMatches.length > 0) {
            this.indexSelection = 0;
        }
    }
    
    
    
    lookForPatternInText( text, pos ) {
        // if pos == 0 : nothing
        if (pos == 0) {
            //console.log( "LFPIT pos==0" );
            this.resetPattern();
            return;
        }
        
        // then check for every possible Patterns type
        //console.log( this.label+" LFPIT check all pos=",pos,"text=",text );
        
        for( let ip=0; ip < this.patternTypes.length; ip++) {
            let patternType = this.patternTypes[ip];
            //console.log( "LFPIT check for",patternType.name);
            // check if its marker is present
            let posMarker = text.lastIndexOf( patternType.marker, pos );

            if (posMarker >= 0) {
                //console.log( "LFPIT marker",patternType.marker,"found at",posMarker);
                this.lookForPatternMatches(
                    text.slice( posMarker+1, pos),
                    patternType
                );
            }
        }
    }
    resetPattern() {
        this.currentPattern = '';
        this.startMatches = [];
        this.otherMatches = [];
        this.indexSelection = -1;
    }
    validActualCompletion() {
        if (this.indexSelection < 0 ) {
            console.log( "COMP VOID" );
            return { text:'', pattern:'' };
        }
        if (this.indexSelection < this.startMatches.length) {
            return {
                text: this.startMatches[this.indexSelection].cmd +
                    this.startMatches[this.indexSelection].type.closing,
                pattern : this.startMatches[this.indexSelection].pattern
            };
        }
        let index = this.indexSelection - this.startMatches.length;
        if (index >= 0) {
            return {
                text: this.otherMatches[index].cmd
                    + this.otherMatches[index].type.closing,
                pattern: this.otherMatches[index].pattern
            };
        }
        else {
            return { text:'', pattern:'' };
        }
    }
    moveSelection( deplacement ) {
        let nbChoices = this.startMatches.length + this.otherMatches.length;
        this.indexSelection += deplacement;
        if (nbChoices == 0) {
            this.indexSelection = -1;
        }
        else if (this.indexSelection < 0)
            this.indexSelection = nbChoices - 1;
        else if (this.indexSelection >= nbChoices)
            this.indexSelection = 0;

        console.log( "SELECT=", this.indexSelection );
    }

    getOverlayElement( nbMax ) {
        let nbStart = this.startMatches.length;
        let nbOther = this.otherMatches.length;
        let nbCandidates = nbStart+nbOther;

        let parentElem = document.createElement( 'ul' );
        parentElem.classList.add( "completion_list" );

        let ic = 0;
        while( ic < nbMax && ic < nbCandidates) {
            // startMatches are inserted first
            if (ic < nbStart) {
                let item = this._createCompletionItem(
                    this.startMatches[ic].cmd,
                    this.startMatches[ic].pattern,
                    ic == this.indexSelection /*selected ?*/
                );
                parentElem.appendChild( item );
                ic += 1;
            }
            // an <hr> rule if needed
            if ((ic == nbStart)
                && (ic < nbMax-1)
                && nbOther > 0) {
                let hrElem = document.createElement( 'hr' );
                parentElem.appendChild( hrElem );
            }
            if (ic >= nbStart && (ic-nbStart) < nbOther) {
                let item = this._createCompletionItem(
                    this.otherMatches[ic - nbStart].cmd,
                    this.otherMatches[ic - nbStart].pattern,
                    ic == this.indexSelection /*selected ?*/
                );
                parentElem.appendChild( item );
                ic += 1;
            }
        }
        return parentElem;
    }
    _createCompletionItem( text, pattern, selected ) {
        // text if pattern === ''
        // otherwise, build RegExp that is global (g) and case insensitive (i)
        // to replace with <mark>$&</mark> where "$&" is the matched pattern
        let html = pattern === '' ? text : text.replace(RegExp(regExpEscape(pattern.trim()), "gi"), "<mark>$&</mark>");

        let item = document.createElement( 'li' );
        item.innerHTML = html;
        item.setAttribute( 'patt-selected', selected ? 'true' : 'false' );

        return item;
    }

    // *************************************************************************
    // **************************************************************** Validity
    /** Look for validity of Token, starting at position lowerLimit
     */
    checkValid( text, lowerLimit ) {
        this.token = {valid: false, from:-1, to:-1};
        // look for a valid pattern
        for( let ip=0; ip < this.patternTypes.length; ip++) {
            let patternType = this.patternTypes[ip];

            // enclose start
            let startPos = text.indexOf( patternType.enclosing.start, lowerLimit );
            if (startPos >= 0) {
                this.token.from = startPos;
                this.token.to = text.indexOf( patternType.enclosing.end, startPos+1 );
                this.token.valid = (this.token.to > this.token.from);
                break; // no need to look for other Pattern
            }
        }
    }
    getInfoElem() {
        let parentElem = document.createElement( 'span' );

        let objectElem = document.createElement( 'span' );
        objectElem.classList.add( "token" );
        if (this.token.valid) {
            objectElem.classList.add( "valid" );
        }
        objectElem.innerHTML = this.label+' ['+this.token.from+', '+this.token.to+'] '; 
        parentElem.appendChild( objectElem );
        
        return parentElem;
    }
};

// *****************************************************************************
// *****************************************************************************
// *****************************************************************************
class CommandLine {
    constructor() {
        this.objectToken = new ObjectToken( 'OBJ', objectPatterns );
        this.actionToken = new ObjectToken( 'ACT', actionPatterns );

        this.currentToken = this.objectToken;
    }

    /**
     */
    update( text, pos ) {
        // Look for Token validity
        this.objectToken.checkValid( text, 0 );
        this.actionToken.checkValid( text, this.objectToken.token.to);

        // Popup will depend on curos position => which TOKEN
        this.currentToken = this.objectToken;
        if (this.actionToken.token.from >= 0 && pos >= this.actionToken.token.from) {
            this.currentToken = this.actionToken;
        }
        //console.log( "CURRENT =",this.currentToken.label, this.actionToken.token.from );
        let token = this.currentToken.token;
        let posVirtual = pos - (token.from >= 0 ? token.from : 0 );
        let textSearched = text.slice(
            token.from >= 0 ? token.from : 0,
            token.to >= 0 ? token.to : text.length
        );
        
        this.currentToken.lookForPatternInText( textSearched, posVirtual );    
    }
    updatePopup( popupElement ) {
        popupElement.appendChild( this.currentToken.getOverlayElement( 5 ));
    }
    
    updateInfo( infoElement ) {
        infoElement.appendChild( this.objectToken.getInfoElem());
        infoElement.appendChild( this.actionToken.getInfoElem());
    }
}
