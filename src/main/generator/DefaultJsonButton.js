import React from 'react';
import jsonDefaultData from "../../data/defaultData";

class DefaultJsonButton extends React.Component {

	render() {
		const json = JSON.stringify(jsonDefaultData, null, "\t");
		const link = "data:'text/json;charset=utf-8," + encodeURIComponent(json) + "'";
		return <div>
			<a className="downloadButton" href={link} download="data.json">Download default JSON</a>
		</div>;
	}
}

export default DefaultJsonButton;