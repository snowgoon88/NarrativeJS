// *****************************************************************************
// test React Component for VIS Physics model
//
// require : story.js (phys_options), physics_comp.js
// *****************************************************************************

const element = <PhysicsComp
                    network={network}
                    barnesHut={phys_options.barnesHut}
                    maxVelocity={phys_options.maxVelocity}
/>;

ReactDOM.render(
    element,
    document.getElementById( 'react_root' )
);


    
