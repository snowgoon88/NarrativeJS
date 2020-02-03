// React Component for Story Relation
//

// name, types, fromName, toName
class RelationComp extends React.Component {
  render() {
    const relType = this.props.name;
    console.log( "RelationComp name=",relType );
    const selectRelTypes = this.props.types.map( function(item) {
      if (name.localeCompare( relType) == 0) {
        return (
          <option
            key={item.id}
            value={item.name}
            selected>
            {item.name}
          </option>);
      }
      else {
        return (
          <option
            key={item.id}
            value={item.name}>
            {item.name}
          </option>);
      }
    });
    
    return (
      <div>
        <div>Relation {this.props.fromName} =&gt; {this.props.toName}</div>
        <table>
          <tbody>
            <tr>
              <td><label>Type : </label></td>
              <td>
              <select>
                {selectRelTypes}
              </select>
              </td>
            </tr>   
          </tbody>
       </table>
      </div>
    );
  }
}

