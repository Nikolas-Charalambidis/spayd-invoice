import React from "react";
import QR from "./generator/QR";
import GenerateButton from "./generator/GenerateButton";

class Generator extends React.Component {

	render() {
		return <div>
			<QR data={this.props.data}/>
			<GenerateButton data={this.props.data}/>
		</div>;
	}
}

export default Generator;