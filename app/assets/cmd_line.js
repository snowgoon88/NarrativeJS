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
        startMark: '$',
        endMark: '',
        addAfter: ' ',
        candidates: function() { return selections; },
        // If valid token starting with '$', endPos is right
        // is AT the end of the token. Ex : $allX
        // otherwise, it is the end to the text
        endPosition: function ( text ) {
            // look for a valid token
            let allCand = this.candidates();
            for( let ic=0; ic < allCand.length; ic++ ) {
                let posStart = text.indexOf( this.startMark+allCand[ic] );
                if ( posStart >= 0) {
                    return {
                        endPos: (posStart + allCand[ic].length + this.startMark.length),
                        token: allCand[ic]
                    };
                }
            }
            return {endPos: -1, token:''};
        }
    },
    {
        name: "person",
        startMark: '"',
        endMark: '"',
        addAfter: ' ',
        candidates: function() { return persons; },
        // return endPos without the endMark => pos where we can still look
        // for pattern completion
        endPosition: function( text ) {
            // look if startMark exists befor endMark
            let startPos = text.indexOf( this.startMark );
            if (startPos >= 0) {
                let endPos = text.indexOf( this.endMark, startPos+1 );
                if (endPos >= 0) {
                    return {
                        endPos: endPos,
                        token: text.slice( startPos+1, endPos )
                    };
                }
            }
            return {endPos: -1, token:''};           
        }
    }
];
var actionPatterns = [
    {
        name: "action",
        startMark: ' ',
        endMark: '',
        addAfter: ' ',
        candidates: function() { return actions; },
        //enclosing: {start:' ', end:' '}
        endPosition: function( text ) {
             // look for a valid token
            let allCand = this.candidates();
            for( let ic=0; ic < allCand.length; ic++ ) {
                let posStart = text.indexOf( this.startMark+allCand[ic] );
                if (posStart >= 0) {
                    return {
                        endPos: (posStart + allCand[ic].length + this.startMark.length),
                        token: allCand[ic]
                    };
                }
            }
            return {endPos: -1, token:'' };
        }
    }
];
var argsPatterns = [
    {
        name: 'arg $person add',
        startMark: ' ',
        endMark: '=',
        addAfter: '"',
        candidates: function() {return ['name', 'sex', 'born'];},
        endPosition: function ( text ) {
            // look for a valid token
            let allCand = this.candidates();
            for( let ic=0; ic < allCand.length; ic++ ) {
                let posStart = text.indexOf( this.startMark+allCand[ic] );
                if ( posStart >= 0) {
                    return {
                        endPos: (posStart + allCand[ic].length + this.startMark.length), // should allow next Token to start at "
                        token: allCand[ic]
                    };
                }
            }
            return {endPos: -1, token:''};
        }
    }
];
var stringPattern = [
    {
        name: 'string',
        startMark: '"',
        endMark: '"',
        addAfter: ' ',
        candidates: function() { return ['bouh']; },
        endPosition: function( text ) {
            // look if startMark exists befor endMark
            let startPos = text.indexOf( this.startMark );
            if (startPos >= 0) {
                let endPos = text.indexOf( this.endMark, startPos+1 );
                if (endPos >= 0) {
                    return {
                        endPos: endPos,
                        token: text.slice( startPos+1, endPos )
                    };
                }
            }
            return {endPos: -1, token:''};
        }
    }
];

var cmdList = [
    { '$all': 
      {
          actions: {
              'show' : {
                  args: {},
                  apply: function( args ) {
                      console.log( 'Other selections are $persones, $relations' );
                  }
              },
          },
      }
    },
    { '$persones':
      {
          actions: {
              'add': {
                  args: { name: 'string', sex: 'string', born: 'string' },
                  apply: function( args ) {
                      story.addPerson( args );
                  }
              },
              'show': {
                  args: {},
                  apply: function( args ) {
                      console.log( 'SHOULD give short list of all persons' );
                  }
              }
          }
      }
    }
];

// when completed, will represent an OBJECT
class ObjectToken {
    constructor( label, patternTypes ) {
        this.label = label;
        this.patternTypes = patternTypes;

        this.valid = false;
        this.from = -1;
        this.to = -1;
        this.token = '',
        this.type = null;

        this.resetPattern();
    }
    hasChoices() {
        return ((this.startMatches.length + this.otherMatches.length) > 0);
    }

    lookForPatternMatches( pattern, type ) {
        console.log( "LFPM pat=|"+pattern+"|, sel="+type.name );
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
        console.log( this.label+" LFPIT check all pos=",pos,"text=|"+text+"|" );
        // if pos == 0 : nothing
        if (pos == 0) {
            //console.log( "LFPIT pos==0" );
            this.resetPattern();
            return;
        }
        
        // then check for every possible Patterns type
        for( let ip=0; ip < this.patternTypes.length; ip++) {
            let patternType = this.patternTypes[ip];
            console.log( "LFPIT check for",patternType.name);
            // check if its marker is present
            let posMarker = text.lastIndexOf( patternType.startMark, pos );

            if (posMarker >= 0) {
                console.log( "LFPIT marker",patternType.startMark,"found at",posMarker);
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
                text: this.startMatches[this.indexSelection].cmd
                    + this.startMatches[this.indexSelection].type.endMark
                    + this.startMatches[this.indexSelection].type.addAfter, 
                pattern : this.startMatches[this.indexSelection].pattern
            };
        }
        let index = this.indexSelection - this.startMatches.length;
        if (index >= 0) {
            return {
                text: this.otherMatches[index].cmd
                    + this.otherMatches[index].type.endMark
                    + this.otherMatches[this.indexSelection].type.addAfter,
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
        this.valid = false;
        this.from = lowerLimit;
        this.to = text.length;
        this.token = '';
        this.type = null;
        
        // look for a valid pattern
        for( let ip=0; ip < this.patternTypes.length; ip++) {
            let patternType = this.patternTypes[ip];

            let res = patternType.endPosition( text.slice( lowerLimit ));
            if (res.endPos >=0) {
                this.valid = true;
                this.to = res.endPos + lowerLimit;
                this.token = res.token;
                this.type = patternType;
                break;
            }
        }
    }
    getInfoElem() {
        let parentElem = document.createElement( 'span' );

        let objectElem = document.createElement( 'span' );
        objectElem.classList.add( "token" );
        if (this.valid) {
            objectElem.classList.add( "valid" );
        }
        objectElem.innerHTML = this.label+' ['+this.from+', '+this.to+'] '; 
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
        this.argsToken = [];

        this.currentToken = this.objectToken;
    }

    /**
     */
    update( text, pos ) {
        // Look for Token validity
        let posCheck = 0;
        this.objectToken.checkValid( text, posCheck );
        posCheck = this.objectToken.to;
        if (this.objectToken.valid) {
            posCheck += this.objectToken.type.endMark.length;
        }
        this.actionToken.checkValid( text, posCheck );
        posCheck = this.actionToken.to;
        if (this.actionToken.valid) {
            posCheck += this.actionToken.type.endMark.length;
        }
        // add some args ?
        if (this.objectToken.valid && this.actionToken.valid &&
            this.argsToken.length == 0 ) {
            // add argsToken
            //this.appendArgs( text );
            this.argsToken.push( new ObjectToken( 'ARG0', argsPatterns ));
            this.argsToken.push( new ObjectToken( 'STR0', stringPattern ));
            this.argsToken.push( new ObjectToken( 'ARG1', argsPatterns ));
            this.argsToken.push( new ObjectToken( 'STR1', stringPattern ));
        }
        // TODO if valid args, add right parameters.
        
        // let posChecking = this.actionToken.to;
        for(let ia = 0; ia < this.argsToken.length; ia++) {
            this.argsToken[ia].checkValid( text, posCheck );
            posCheck = this.argsToken[ia].to;
            if (this.argsToken[ia].valid) {
                posCheck += this.argsToken[ia].type.endMark.length;
            }
        }

        // Popup will depend on cursor position => which TOKEN
        this.currentToken = null;
        if (pos >= this.objectToken.from && pos <= this.objectToken.to ) {
            this.currentToken = this.objectToken;
        }
        else if (pos >= this.actionToken.from && pos <= this.actionToken.to ) {
            this.currentToken = this.actionToken;
        }
        else {
            for(let ia = 0; ia < this.argsToken.length; ia++) {
                if (pos >= this.argsToken[ia].from &&
                    pos <= this.argsToken[ia].to ) {
                    this.currentToken = this.argsToken[ia];
                    break;
                }
            }
        }

        if (this.currentToken != null ) {
            let textSearched = text.slice( this.currentToken.from,
                                           this.currentToken.to );
            let posVirtual = pos - this.currentToken.from;
            console.log( "CURRENT =",this.currentToken.label);
            this.currentToken.lookForPatternInText( textSearched, posVirtual );
        }
        else {
            console.log( "CURRENT = NULL" );
        }
    }

    // appendArgs( text ) {
    //     let objectT = this.objectToken.token;
    //     let actionT = this.actionToken.token;
        
    //     console.log( 'ARGS obj=|'+objectT+'| act=|'+actionT+'|' );
    //     for( let ic=0; ic<cmdList.length; ic++) {
    //         if (cmdList[ic].object.localeCompare( objectT ) == 0) {
    //             let args = cmdList[ic].actions[actionT].args;
    //             console.log( '    args=',args );

    //             for (const [key, type] of Object.entries( args )) {
    //                 console.log( "PatType for",key,type );
    //                 let patternType = this.patternFromArgsType( key, type );
    //                 console.log( "PatTYPE ",patternType );
    //                 this.argsToken.push( new ObjectToken( key, patternType ));
    //             }
                       
    //             break;
    //         }
    //     }
    // }
    // patternFromArgsType( argName, argType ) {
    //     let patternType = null;
    //     for( let ia=0; ia < argsPatterns.length; ia++ ) {
    //         console.log( 'compare with',argsPatterns[ia].name );
    //         if (argsPatterns[ia].name.localeCompare( argType ) == 0) {
    //             patternType = argsPatterns[ia];
    //             patternType.marker = argName+patternType.marker;
    //             patternType.enclosing.start = patternType.marker;

    //             return patternType;
    //         }
    //     }
    //     return patternType;
    // }
    
    updatePopup( popupElement ) {
        if (this.currentToken != null && this.currentToken.hasChoices() ) {
            popupElement.appendChild( this.currentToken.getOverlayElement( 5 ));
            popupElement.classList.remove( "hidden" );
        }
        else {
            popupElement.innerHTML = '--VOID--';
            popupElement.classList.add( "hidden" );
        }
    }
    
    
    updateInfo( infoElement ) {
        infoElement.appendChild( this.objectToken.getInfoElem());
        infoElement.appendChild( this.actionToken.getInfoElem());
        for(let ia = 0; ia < this.argsToken.length; ia++) {
            infoElement.appendChild( this.argsToken[ia].getInfoElem());
        }
    }
}
