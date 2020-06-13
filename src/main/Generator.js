import React from 'react';
import jsonData from "../data/defaultData";
import GenerateButton from "./generator/GenerateButton"
import DefaultJsonButton from "./generator/DefaultJsonButton";
import QR from "./generator/QR"

class Generator extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			jsonFile: null,
			loaded: 0,
			data: this.recalculateData(jsonData)
		}
	}

	render() {
		return <div>
			<input type="file" name="file" onChange={this.onChangeHandler}/>
			<DefaultJsonButton/>
			<QR data={this.state.data}/>
			<GenerateButton data={this.state.data}/>
		</div>;
	}

	onChangeHandler = event => {
		console.log("files: ", event.target.files[0]);
		this.setState({
			jsonFile: event.target.files[0],
			loaded: 1,
		});
		console.log("onChangeHandler: ", this.state.data);
	};

	recalculateData = data => {
		const items = data.items;
		data.summary = {};
		data.summary.priceTotalSum = 0;
		data.summary.priceTotalWithVatSum = 0;

		for (var i = 0; i < items.length; i++) {
			const vatCoef = 1 + data.items[i].vatPercentage / 100;
			const amount = data.items[i].amount;

			const price = data.items[i].price;
			const priceWithVat = price * vatCoef;

			data.items[i].price = price;
			data.items[i].priceWithVat = priceWithVat;

			const totalPrice = price * amount;
			const totalPriceWithVat = priceWithVat * amount;

			data.items[i].totalPrice = totalPrice;
			data.items[i].totalPriceWithVat = totalPriceWithVat;

			data.summary.priceTotalSum += totalPrice;
			data.summary.priceTotalWithVatSum += totalPriceWithVat;
		}
		console.log("recalculateData: ", data);
		return data;
	};
}

export default Generator;