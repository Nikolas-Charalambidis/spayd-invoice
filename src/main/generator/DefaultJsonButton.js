import React from 'react';
import jsonDefaultData from "../../data/defaultData";

class DefaultJsonButton extends React.Component {

	render() {
		const json = JSON.stringify(jsonDefaultData, null, "\t");
		const link = "data:'text/json;charset=utf-8," + encodeURIComponent(json) + "'";
		return <a href={link} download="data.txt">Download JSON</a>
	}
}

export default DefaultJsonButton;