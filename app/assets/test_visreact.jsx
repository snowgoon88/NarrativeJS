// *****************************************************************************
// test React Component for VIS Physics model
//
// require : story.js (phys_options), physics_comp.js
// *****************************************************************************

const exampleRelation = {
    name: 'Pousse',
    from: 0,
    to: 1
};

const element = <div>
  <PhysicsComp
    network={network}
    barnesHut={phys_options.barnesHut}
    maxVelocity={phys_options.maxVelocity}
  />
  <RelationComp
    relation={exampleRelation}
  />
  </div>;

const reactRel = <div>
    <RelationComp
    relation={null}
  />
  </div>;

ReactDOM.render(
    element,
    document.getElementById( 'react_root' )
);

ReactDOM.render(
    reactRel,
    document.getElementById( 'react_relation' )
);
// @see https://reactjs.org/docs/react-dom.html#render

/* Render a React element into the DOM in the supplied container and return a reference to the component (or returns null for stateless components).
 * 
 * f the React element was previously rendered into container, this will perform an update on it and only mutate the DOM as necessary to reflect the latest React element.
 *                                                                                   If the optional callback is provided, it will be executed after the component is rendered or updated.      */                                                

// callback when a Story edge (relation) is selected
network.on( 'selectEdge', function( event ) {
    console.log( 'event.edges=',event.edges );
    let selEdge = story.edges.get( event.edges[0] );
    console.log( 'selEdge=', selEdge );
    //let fromName = story.nodes.get(selEdge.from).label;
    //let toName = story.nodes.get(selEdge.to).label;
    let reactEdge =
        <div>
            <RelationComp
                relation={selEdge}
            />
        </div>;
    ReactDOM.render(
        reactEdge,
        document.getElementById( 'react_relation' )
    );
});
// callback when a Story NodePerson (person) is selected
network.on( 'selectNode', function( event ) {
    let selPerson = story.nodes.get( event.nodes[0] );
    let reactPerson =
        <div>
            <PersonComp
                person={selPerson}
            />
        </div>;
    ReactDOM.render(
        reactPerson,
        document.getElementById( 'react_relation' )
    );
    
});
