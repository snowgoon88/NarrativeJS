// React Component for Vis Physics GUI
//

class RangeComp extends React.Component {
    constructor(props) {
        super( props );
        this.handleValueChange = this.handleValueChange.bind(this);
    }
    handleValueChange(e) {
        console.log( this.props.keyName+" = ",e.target.value );
        this.props.onValueChange(this.props.keyName, e.target.value);
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
            gravK : bu.gravitationalConstant,
            gravC : bu.centralGravity,
            springL : bu.springLength,
            springK : bu.springConstant,
            damping : bu.damping,
            avoidOverlap : bu.avoidOverlap,
            maxSpd : this.props.maxVelocity
        };
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange( keyName, value ) {
        console.log( "State change "+keyName+" = ",value );
        const newState = {};
        newState[keyName] = value;
        this.setState( newState );
        this.changeOptions();
    }   
    changeOptions() {
        const opt = {
            physics : {
                barnesHut : {
                    gravitationalConstant : parseInt(this.state.gravK),
                    centralGravity : parseFloat(this.state.gravC),
                    springLength : parseInt(this.state.springL),
                    springConstant : parseFloat(this.state.springK),
                    damping : parseFloat(this.state.damping),
                    avoidOverlap : parseFloat(this.state.avoidOverlap)
                },
                maxVelocity : parseInt(this.state.maxSpd)
            }
        };
        this.props.network.setOptions( opt );
    }
    render() {
        return (
            <table>
            <tbody>
                    <RangeComp
                        title="Maximum Speed"
                        keyName="maxSpd"
                        value={this.state.maxSpd}
                        onValueChange={this.handleChange}
                        min="5" max="100" step="5"
                    />
                    <RangeComp
                        title="Gravity Constant"
                        keyName="gravK"
                        value={this.state.gravK}
                        onValueChange={this.handleChange}
                        min="-100000" max="-1000" step="1000"
                    />
                    <RangeComp
                        title="Gravity Central"
                        value={this.state.gravC}
                        keyName="gravC"
                        onValueChange={this.handleChange}
                        min="0" max="5" step="0.1"
                    />
                    <RangeComp
                        title="Spring Length"
                        value={this.state.springL}
                        keyName="springL"
                        onValueChange={this.handleChange}
                        min="10" max="1000" step="5"
                    />
                    <RangeComp
                        title="Spring Constant"
                        value={this.state.springK}
                        keyName="springK"
                        onValueChange={this.handleChange}
                        min="0" max="1" step="0.01"
                    />
                    <RangeComp
                        title="Damping"
                        value={this.state.damping}
                        keyName="damping"
                        onValueChange={this.handleChange}
                        min="0" max="1" step="0.01" 
                    />
                    <RangeComp
                        title="Avoid Overlap"
                        value={this.state.avoidOverlap}
                        keyName="avoidOverlap"
                        onValueChange={this.handleChange}
                        min="0" max="1" step="0.1"
                    />
                </tbody>
            </table>
        );
    }
}


