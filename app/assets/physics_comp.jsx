// React Component for Vis Physics GUI
//

class RangeComp extends React.Component {
    constructor(props) {
        super( props );
        this.handleValueChange = this.handleValueChange.bind(this);
    }
    handleValueChange(e) {
        console.log( this.props.title+" = ",e.target.value );
        this.props.onValueChange(e.target.value);
    }
    render() {
        return (
            <tr>
                <td><label>{this.props.title} : </label></td>
                <td>
                    <input
                        type="number"
                        value={this.props.value}
                        onChange={this.handleValueChange}
                        min={this.props.min}
                        max={this.props.max}
                        step={this.props.step}
                    />
                </td>
            </tr>
        );
    }
}
class PhysicsComp extends React.Component {
    constructor( props ) {
        super( props );

        const bu = this.props.barnesHut;
        this.state = {
            gravK : bu.gravitationalConstant
        };
        this.handleGravKChange = this.handleGravKChange.bind(this);
    }
    handleGravKChange( gravKValue ) {
        console.log( "State change gravK = ",gravKValue );
        this.setState( {
            gravK : gravKValue
        });
    }
    render() {
        const bu = this.props.barnesHut;
        console.log( "PC ",bu );
        return (
            <table>
                <tbody>
                    <RangeComp
                        title="Gravity Constant"
                        value={this.state.gravK}
                        onValueChange={this.handleGravKChange}
                        min="-100000" max="-1000" step="1000"
                    />
                    <RangeComp title="Gravity Central" value={bu.centralGravity} />
                    <RangeComp title="Spring Length" value={bu.springLength} />
                    <RangeComp title="Spring Constant" value={bu.springConstant} />
                    <RangeComp title="Damping" value={bu.damping} />
                    <RangeComp title="Avoid Overlap" value={bu.avoidOverlap} />
                </tbody>
            </table>
        );
    }
}


