// Various global utils functions
//
// "use strict";

// **************************************************************** regExpEscape
/**
 * Add an '\' in front of -\^$*+?.()|[]{}
 */
var regExpEscape = function (s) {
    return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
}
// *****************************************************************************
// ************************************************************************* pad
/** max padding is 10 !! */
function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}
// *****************************************************************************
// ***************************************************************** displayDate
function displayDate( date ) {
    var msg = "";
    if (date) {
        msg += pad( date.getUTCDate(), 2);
        msg += "/"+pad( date.getUTCMonth()+1, 2);
        msg += "/"+date.getUTCFullYear();
        msg += " "+pad( date.getUTCHours(), 2)+":"+pad( date.getUTCMinutes(), 2);
    }
    else {
        msg += "--";
    }
    return msg;
}
// *****************************************************************************
// ****************************************************************** displayMsg
/**
* Display msg in div id=divName, preceded by beforeStr if given, replace older
* message if append is not true
*/
function displayMsg( divName, msg, beforeStr, append ) {
    if (beforeStr) {
        msg = beforeStr + msg;
    }
    var elem = document.getElementById( divName );
    if (append === true ) {
        console.log( 'appendMsg'+divName+': '+msg );
        elem.innerHTML = elem.innerHTML+msg;
    }
    else {
        console.log( 'displayMsg'+divName+': '+msg );
        elem.innerHTML = msg;
    }
}
// *****************************************************************************
