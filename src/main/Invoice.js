import React from 'react';
import jsonData from "../data/defaultData";
import ReactFileReader from 'react-file-reader';
import Generator from "./Generator";
import DefaultJsonButton from "./generator/DefaultJsonButton";

class Invoice extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			data: this.recalculateData(jsonData)
		};
	}

	render() {
		return <div>
			<Generator data={this.state.data} />
			<DefaultJsonButton/>
			<ReactFileReader handleFiles={this.handleFiles} fileTypes={'.json'}>
				<button className='btn'>Upload</button>
			</ReactFileReader>
		</div>;
	}

	handleFiles = (files) => {
		const scope = this;
		const reader = new FileReader();
		reader.onload = function(e) {
			scope.setState({
				data: scope.recalculateData(JSON.parse(reader.result.toString()))
			});
		};
		reader.readAsText(files[0]);
	};

	recalculateData = (data) => {
		const items = data.items;
		data.summary = {};
		data.summary.priceTotalSum = 0;
		data.summary.priceTotalWithVatSum = 0;

		for (var i = 0; i < items.length; i++) {
			const vatCoeficient = 1 + data.items[i].vatPercentage / 100;
			const price = data.items[i].price;
			const amount = data.items[i].amount;

			const priceWithVat = price * vatCoeficient;
			const totalPrice = price * amount;
			const totalPriceWithVat = priceWithVat * amount;

			data.items[i].price = price;
			data.items[i].priceWithVat = priceWithVat;
			data.items[i].totalPrice = totalPrice;
			data.items[i].totalPriceWithVat = totalPriceWithVat;

			data.summary.priceTotalSum += totalPrice;
			data.summary.priceTotalWithVatSum += totalPriceWithVat;
		}
		return data;
	};
}

export default Invoice;