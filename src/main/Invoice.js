import React from 'react';
import jsonData from "../data/defaultData";
import ReactFileReader from 'react-file-reader';
import Generator from "./Generator";
import DownloadJsonButton from "./generator/DownloadJsonButton";
import dateFormat from "dateformat";
import * as Json from "./function/Json";

class Invoice extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			data: this.recalculateData(Json.clone(jsonData)),
			fileName: "Default JSON",
			uploadDate: null
		};
	}

	render() {
		return <div>
			{this.state.uploadDate == null ?
				<h1>{this.state.fileName}</h1> :
				<div>
					<h1>{this.state.fileName}</h1>
					<h3>{dateFormat(this.state.uploadDate.toLocaleString(), "dd.mm.yyyy HH:MM:ss")}</h3>
				</div>}
			<Generator data={this.state.data} />
			<DownloadJsonButton data={Json.clone(jsonData)}>Download Default Json</DownloadJsonButton>
			<DownloadJsonButton data={this.cleanData(this.state.data)}>Download Current Json</DownloadJsonButton>
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
		scope.setState({
			fileName: files[0].name,
			uploadDate: new Date()
		});
		reader.readAsText(files[0]);
		console.log("DATA", scope.state.data)
	};

	cleanData = (input) => {
		const data = Json.clone(input);
		delete data.summary;

		const items = data.items;
		for (let i = 0; i < items.length; i++) {
			delete data.items[i].priceWithVat;
			delete data.items[i].totalPrice;
			delete data.items[i].totalPriceWithVat;
		}
		return data;
	};

	recalculateData = (data) => {
		const items = data.items;
		data.summary = {};
		data.summary.priceTotalSum = 0;
		data.summary.priceTotalWithVatSum = 0;

		for (let i = 0; i < items.length; i++) {
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