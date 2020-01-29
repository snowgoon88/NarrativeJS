const phys_options = {
    barnesHut : {
        gravitationalConstant : -2000,
        centralGravity : 0.3,
        springLength : 95,
        springConstant : 0.04,
        damping : 0.09,
        avoidOverlap : 0
    }
};
const element = <PhysicsComp barnesHut={phys_options.barnesHut} />;

ReactDOM.render(
    element,
    document.getElementById( 'react_root' )
);


    
