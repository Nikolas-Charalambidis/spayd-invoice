import React from 'react';

class DownloadJsonButton extends React.Component {

	render() {
		const json = JSON.stringify(this.props.data, null, "\t");
		const link = "data:'text/json;charset=utf-8," + encodeURIComponent(json) + "'";
		return <div>
			<a className="downloadButton" href={link} download="data.json">{this.props.children}</a>
		</div>;
	}
}

export default DownloadJsonButton;