// React Console Component
//
// Require : 
// - utils.js (for regExpEscape )
// - text-area-caret-position.js (for getCaretCoordinates)

var popupNode = document.getElementById( 'completion_popup' );
var infoNode = document.getElementById( 'info' );
var _offLeft = 0;
var _offTop = 0;
popupNode.style.display = 'block';


var completionPatterns = [
    {
        cmd: 'addperson',
        alias: ['addperson', 'ap', 'newperson', 'np'],
    },
    {
        cmd: 'addrelation',
        alias: ['addrelation', 'ar', 'newrelation', 'nr'],
    },
    {
        cmd: 'addrelative1',
        alias: ['addrelative1']
    },
    {
        cmd: 'addrelative2',
        alias: ['addrelative1']
    },
    {
        cmd: 'addrelative3',
        alias: ['addrelative1']
    },
    {
        cmd: 'addrelative4',
        alias: ['addrelative1']
    },
    {
        cmd: 'addrelative5',
        alias: ['addrelative1']
    },
    {
        cmd: 'addrelative6',
        alias: ['addrelative1']
    },
    {
        cmd: 'relatif',
        alias: ['relatif']
    },
];
var _caseSensitive = false;

/**
 * Look (in completionPatterns) for alias that either
 *  - starts with pattern => added to startMatches
 *  - contains pattern    => added to otherMatches
 *
 * A cmd in startMatches will ne be in otherMatches
 *
 * Returns : { startMatches, otherMatches }
 */
function lookForPatternMatches( pattern ) {
    // regexp search pattern, case sensitive
    let flagSearch = _caseSensitive ? "" : "i" ;
    let regpat = RegExp( regExpEscape(pattern), flagSearch );
    let regpat_start = RegExp( "^"+regExpEscape(pattern), flagSearch );

    let startMatches = [];
    let otherMatches = [];
    for( let ip=0; ip<completionPatterns.length; ip++ ) {
        console.log( "SP cmd=",completionPatterns[ip].cmd );
        let aliases = completionPatterns[ip].alias;
        let foundStart = false;
        
        // Test first all aliases for startMatches
        for( let ia=0; ia<aliases.length; ia++ ) {
            console.log( "  SP start alias=",aliases[ia] );
            if (regpat_start.test( aliases[ia] )) {
                console.log( "^^",aliases[ia],
                             " for ",completionPatterns[ip].cmd );
                startMatches.push( completionPatterns[ip].cmd );
                foundStart = true;
                break;
            }
        }
        if (foundStart != true) {
            
            // and then for otherMatches
            for( let ia=0; ia<aliases.length; ia++ ) {
                console.log( "  SP other alias=",aliases[ia] );
                if (regpat.test( aliases[ia] )) {
                    console.log( "..",aliases[ia]," for ",completionPatterns[ip].cmd );
                    otherMatches.push( completionPatterns[ip].cmd );
                    break;
                }
            }
        }
    }

    return {
        startMatches : startMatches,
        otherMatches : otherMatches
    };
}
    
var recognizedPattern = '';
var potentielCompletions = [];


/**
 * Look for a valid Pattern in text, starting backward from cursor/endSelection
 * - starts with ':', with no SPACE between ':' and cursor
 *
 * Returns : { pattern, posPattern}, {'',-1} if not found 
 */
function lookForPatternInText( text, cursorPos ) {
    // goes backward until it finds either ':' => PATTERN or SPACE/^ => ''
    let posPattern = cursorPos;
    while( true ) {
        if (posPattern == 0) {
            return { pattern:'', posPattern:-1 };
        }
        posPattern = posPattern-1;
        let car = text[posPattern];

        if (car == ' ') {
            return { pattern:'', posPattern:-1 };
        }

        if (car == ':') {
            return {
                pattern: text.slice( posPattern, cursorPos ),
                posPattern: posPattern
            };
            
        }
    }
};
function resetPattern() {
    recognizedPattern = '';
};
function searchPatterns( car ) {
    console.log( "SEARCHPATTERNS car=",car );
    // ':' and empty recognized, then initiate
    if (car == ':' && recognizedPattern == '') {
        recognizedPattern += car;
    }
    else if (recognizedPattern != '' ) {
        recognizedPattern += car;
        potentielCompletions = lookForPatternMatches(
            recognizedPattern.slice( 1 ) // not including first character
        );
    }
    console.log( "SEARCHPATTERNS recognized=",recognizedPattern,
                 " pot=",potentielCompletions
    );
};

function createCompletionItem( text, pattern, selected ) {
    // text if pattern === ''
    // otherwise, build RegExp that is global (g) and case insensitive (i)
    // to replace with <mark>$&</mark> where "$&" is the matched pattern
    let html = pattern === '' ? text : text.replace(RegExp(regExpEscape(pattern.trim()), "gi"), "<mark>$&</mark>");

    let item = document.createElement( 'li' );
    item.innerHTML = html;
    item.setAttribute( 'patt-selected', selected ? 'true' : 'false' );

    return item;
};
/**
 * Populate an Element with potentialCompletions.
 * pattern is highlighted
 */
function populateOverlay( elem, candidates, nbMax, pattern ) {
    // Erase actual content
    while (elem.firstChild) {
        elem.removeChild( elem.lastChild );
    }

    let nbStart = candidates.startMatches.length;
    let nbOther = candidates.otherMatches.length;
    let nbCandidates = nbStart+nbOther;

    let parentElem = document.createElement( 'ul' );
    parentElem.classList.add( "completion_list" );
    
    let ic = 0;
    while( ic < nbMax && ic < nbCandidates) {
        // startMatches are inserted first
        if (ic < nbStart) {
            let item = createCompletionItem(
                candidates.startMatches[ic],
                pattern,
                ic == 0
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
            let item = createCompletionItem(
                candidates.otherMatches[ic - nbStart],
                pattern,
                ic == 0
            );
            parentElem.appendChild( item );
            ic += 1;
        }
    }
    elem.appendChild( parentElem );
}

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
                     " alt=", event.altKey, "sel=", event.target.selectionStart,"/",event.target.selectionEnd
        );
        //console.log( event );
        if (event.key == "Tab") {
            console.log( " -> Tab prevented" );
            event.preventDefault();
        }

        let caret = getCaretCoordinates(
            event.target,
            event.target.selectionEnd
        );
        infoNode.innerHTML = "caret at "+caret.left+" x "+caret.top;
    }
    handleKeyPress( event ) {
        var keyCode = event.keyCode || event.which; // key event for firefox
        console.log( "K_PRESS char=", event.charcode,
                     " key=",event.key, " keyCode=",event.keyCode,"/",keyCode,
                     " shift=",event.shiftKey, " ctrl=", event.ctrlKey,
                     " alt=", event.altKey 
        );

        // Use Press as character are always letters or ENTER
        if (keyCode != 13) { // ENTER
            searchPatterns( String.fromCharCode( keyCode ) );
        }
    }
    handleKeyUp( event ) {
        console.log( "K_UP char=",  event.charcode,
                     " key=",event.key, " keyCode=",event.keyCode,
                     " shift=",event.shiftKey, " ctrl=", event.ctrlKey,
                     " alt=", event.altKey, "sel=", event.target.selectionStart,"/",event.target.selectionEnd
        );
        let pat = lookForPatternInText(
            event.target.value,
            event.target.selectionEnd
        );
        console.log( "PAT = ",pat );
        if (pat.posPattern >= 0) {
            let candidates = lookForPatternMatches( pat.pattern.slice(1) );
            populateOverlay( popupNode, candidates, 5, pat.pattern.slice(1) );
        }
        else {
            populateOverlay( popupNode, [], 5, '' );
        }

        // Set popupPosition
        let areaNode = event.target;
        // Must get coordinate
	// Cursor coordinates within area + area coordinates + scroll
        let coord = getCaretCoordinates(areaNode, areaNode.selectionEnd);
        let styleSize = getComputedStyle(areaNode).getPropertyValue('font-size');
        let fontSize = parseFloat(styleSize);
        
        popupNode.style.left = (_offLeft+areaNode.offsetLeft-areaNode.scrollLeft+coord.left) + 'px';
	popupNode.style.top = (_offTop+areaNode.offsetTop-areaNode.scrollTop+coord.top+fontSize*1) + 'px';
	
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