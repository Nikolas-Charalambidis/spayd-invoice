import React from "react";

class LoadFile extends React.Component {

	render() {
		return <input type="file" name="file" onChange={this.onChangeHandler}/>
	}
}
