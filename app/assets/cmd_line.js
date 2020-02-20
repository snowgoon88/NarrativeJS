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

var objectPatterns = [
    {
        name: "selection",
        marker: '$',
        closing: '',
        candidates: function() { return selections; },
    },
    {
        name: "person",
        marker: '"',
        closing: '"',
        candidates: function() { return persons; },
    }
];

// when completed, will represent an OBJECT
class ObjectToken {
    constructor() {
        this.completed = false;
        this.choice = null;

        this.resetPattern();
    }

    // refineActualMatches( pattern ) {
    //     // regexp search pattern, case sensitive
    //     let flagSearch = _caseSensitive ? "" : "i" ;
    //     let regpat = RegExp( regExpEscape(pattern), flagSearch );
    //     let regpat_start = RegExp( "^"+regExpEscape(pattern), flagSearch );

    //     let tmpStart = [];
    //     let tmpOther =[];

    //     // refine pattern startMatches
    //     let im = 0;
    //     for( im=0; im<this.startMatches.length; im++) {
    //         if (regpat_start.test( this.startMaches[im])) {
    //             tmpStart.push( this.startMaches[im] );
    //         }
    //         else if (regpat.test( this.startMaches[im])) {
    //             tmpOther.push( this.startMaches[im] );
    //         }
    //     }
    //     // then otherMatches
    //     for( im=0; im<this.otherMatches.length; im++) {
    //         if (regpat_start.test( this.otherMatches[im] )) {
    //             tmpOther.push( this.otherMaches[im] );
    //         }
    //     }
    //     this.startMatches = tmpStart;
    //     this.otherMatches = tmpOther;
    // }
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
            console.log( "LFPIT pos==0" );
            this.resetPattern();
            return;
        }
        
        // // check if currentPattern is still searched for => nothing to do
        // let similarPat = text.slice( pos-this.currentPattern.length, pos);
        // if (this.currentPattern.localeCompare( similarPat ) == 0 ) {
        //     console.log( "LFPIT similarPat", this.currentPattern );
        //     return;
        // }

        // // check if currentPattern is only augmented by ONE char
        // // then only refine potentialCompletions
        // similarPat = text.slice( pos-this.currentPattern.length-1, pos);
        // if (similarPat.startsWith( this.currentPattern )) {
        //     console.log( "LFPIT expanded", this.currentPattern, "with",similarPat);
        //     this.refineActualMatches( similarPat );
        //     return;
        // }

        // then check for every possible Patterns type
        console.log( "LFPIT check all" );
        
        for( let ip=0; ip < objectPatterns.length; ip++) {
            let patternType = objectPatterns[ip];
            console.log( "LFPIT check for",patternType.name);
            // check if its marker is present
            let posMarker = text.lastIndexOf( patternType.marker, pos );

            if (posMarker >= 0) {
                console.log( "LFPIT marker",patternType.marker,"found at",posMarker);
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
};

