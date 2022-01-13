import React from 'react';

class ShowPairs extends React.Component {

    render() { 
  
      const rows = this.props.pairs.reduce(function (rows, key, index) { 
        return (index % 2 === 0 ? rows.push([key.replaceAll("&lt;", "<").replaceAll("&gt;", ">")]) : rows[rows.length-1].push(key.replaceAll("&lt;", "<").replaceAll("&gt;", ">"))) && rows;
      }, []);
  
      return (
        <table style={{borderWidth:"1px", borderStyle:'solid'}}>
            {rows.map(column => <tr style={{margin: "10px", borderWidth:"1px", borderStyle:'solid'}}><td style={{margin: "10px", borderWidth:"1px", borderStyle:'solid'}}>{column[0]}</td><td style={{margin: "10px", borderWidth:"1px", borderStyle:'solid'}}>{column[1]}</td></tr>)}
        </table>
      );
    }
  }

  export default ShowPairs;