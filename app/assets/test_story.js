// *****************************************************************************
// test the Story and its visualization using VIS.js
//
// Require : story.js
// *****************************************************************************

// ************************************************************************* TMP
// // list key, values
// let tmp = { allo : "qui", num : 3 };

// for (const [key, value] of Object.entries(tmp)) {
//   console.log(key, value);
// }
// *****************************************************************************

// create story
let story = new Story();

// create network using story in proper container
let container = document.getElementById( 'vis_canvas' );
const phys_options = {
    barnesHut : {
        gravitationalConstant : -2000,
        centralGravity : 0.3,
        springLength : 200,
        springConstant : 0.04,
        damping : 0.09,
        avoidOverlap : 0.7
    },
    maxVelocity : 15
};
let options = {
    physics : phys_options
};
//let network = new vis.Network( container, { nodes : story.nodes }, options );
let network = new vis.Network( container, story, options );

let cmdList01 = [
    "story.addRelationType( 'Pousse' )",
    "story.debugList( 'RelType', story.relationTypes.types )",
    "story.addRelationType( 'Pousse' )",
    "story.addRelationType( 'déteste' )",
    "story.debugList( 'RelType', story.relationTypes.types )",
    "story.addPerson( {name : 'Node 0', sex : 'M', clan : 'renard'} )",
    "story.addPerson( {name:'Node 1', sex:'F', clan:'guepe'} )",
    "story.addPerson( {name:'Node 2', sex:'M', clan:'dragon'} )",
    "story.addPerson( {name:'Node 3', sex:'F'} )",
    "story.addPerson( {name:'Node 4', clan:'crab'} )",
    "story.debugList( 'Node', story.nodes )",
    "story.addRelation( 'Node 1', 'Node 2', 'Pousse' )",
    "story.debugList( 'Edge', story.edges )",
    "story.addRelation( 'Node 0', 'Node 2', 'déteste' )",
    "story.addRelation( 'Node 2', 'Node 1', 'déteste' )",
    "story.addRelation( 'Node 2', 'Node 1', 'Pousse' )",
    "story.delPerson( 'Node 3')",
    "story.delPerson( 'Node 1' )",
    "story.debugList( 'Edge', story.edges )",
    "story.editPerson( 'Node 0', { sex : 'F' } )",
    "story.editPerson( 'Node 0', { name : 'Gros' } )",
    "story.editPerson( 'Gros', { name : 'Copain', sex : 'M' } )",
    "story.editPerson( 'Copain', { clan : 'heron' })",
    "story.debugList( 'Node', story.nodes )",
];
let cmdList02 = [
    "story.addRelationType( 'Pousse' )",
    "story.addRelationType( 'déteste' )",
    "story.addPerson( {name : 'Node 0', sex : 'M', clan : 'renard'} )",
    "story.addPerson( {name:'Node 1', sex:'F', clan:'guepe'} )",
    "story.addPerson( {name:'Node 2', sex:'M', clan:'dragon'} )",
    "story.addPerson( {name:'Nodé 3', sex:'F'} )",
    "story.addPerson( {name:'Node 4', clan:'crab'} )",
    "story.addRelation( 'Node 1', 'Node 2', 'Pousse' )",
    "story.addRelation( 'Node 0', 'Node 2', 'déteste' )",
    "story.addRelation( 'Node 2', 'Node 1', 'déteste' )",
    "story.addRelation( 'Node 2', 'Node 1', 'Pousse' )",
];

let cmdList03 = [
    "story.addRelationType( 'Pousse' )",
    "story.addRelationType( 'déteste' )",
];

let cmdList = cmdList01;
let cmdIndex = 0;
function nextCmd() {
    if (cmdIndex < cmdList.length ) {
        console.log( cmdList[cmdIndex] );
        eval( cmdList[cmdIndex] );
        cmdIndex += 1;
    }
    else {
        console.log( 'No more command' );
    }
}

function batchCmd( cmdList ) {
    for(var i = 0; i < cmdList.length; i++) {
        eval( cmdList[i] );
    }
}
batchCmd( cmdList03 );
