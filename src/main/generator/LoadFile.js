import React from "react";

class LoadFile extends React.Component {

	render() {
		return <div>
			<input type="file" name="file" onChange={this.onChangeHandler}/>
		</div>
	}
}
