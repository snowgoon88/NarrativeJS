// *****************************************************************************
// test React Component for VIS Physics model
//
// require : story.js (phys_options), physics_comp.js
// *****************************************************************************


const element = <div>
  <PhysicsComp
    network={network}
    barnesHut={phys_options.barnesHut}
    maxVelocity={phys_options.maxVelocity}
  />
  <RelationComp
    name="ESSAI"
    types={story.relationTypes.types}
    fromName="n_FROM"
    toName="n_TO"
  />
  </div>;

const reactRel = <div>
  <RelationComp
    name="ESSAI"
    types={story.relationTypes.types}
    fromName="n_FROM"
    toName="n_TO"
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
