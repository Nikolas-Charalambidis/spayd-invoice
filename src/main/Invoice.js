import React from 'react';
import jsonData from "../data/defaultData";
import ReactFileReader from 'react-file-reader';
import Generator from "./Generator";
import DownloadJsonButton from "./generator/DownloadJsonButton";
import dateFormat from "dateformat";
import * as Json from "./function/Json";
import hash from "object-hash";

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
					<h3>{this.state.uploadDate.toLocaleString()}</h3>
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
			const recalculated = scope.recalculateData(JSON.parse(reader.result.toString()));
			scope.setState({
				data: recalculated
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

	getFirstGroup = (regexp, str) => {
		return this.getGroups(regexp, str)[0];
	}

	getGroups = (regexp, str) => {
		return Array.from(str.matchAll(regexp), m => m[1]);
	}

	recalculateData = (data) => {

		data.configuration.constants = data.configuration.constants === undefined ? {} : data.configuration.constants;

		const today = data.configuration.constants.today === undefined ? new Date() : new Date(data.configuration.constants.today);
		data.configuration.constants.today = dateFormat(today, "yyyy-mm-dd");
		data.configuration.constants.day = dateFormat(today, "dd");
		data.configuration.constants.month = dateFormat(today, "mm");
		data.configuration.constants.year = dateFormat(today, "yyyy");

		data = this.modifiedJson(data, (value) => {
			return this.templated(value, data.configuration.constants);
		});

		const items = data.items;
		const summary = {};
		summary.vatSum = 0;
		summary.priceTotalSum = 0;
		summary.priceTotalWithVatSum = 0;

		summary.vat = new Map();
		summary.hasVat = false;

		const amountRegex = /(\d+(?:[.,]\d+)?).*/g;

		for (let i = 0; i < items.length; i++) {
			const vatPercentage = parseFloat(data.items[i].vatPercentage === undefined ? 0 : data.items[i].vatPercentage);
			const vatCoeficient = 1 + vatPercentage / 100;

			if (vatPercentage !== 0) {
				summary.hasVat = true;
			}

			const price = parseFloat(data.items[i].price);
			const amount = parseFloat(this.getFirstGroup(amountRegex, data.items[i].amount));

			const priceWithVat = price * vatCoeficient;
			const totalPrice = price * amount;
			const totalPriceWithVat = priceWithVat * amount;
			const vat = totalPriceWithVat - totalPrice;

			data.items[i].amount = amount;
			data.items[i].price = price;
			data.items[i].priceWithVat = priceWithVat;
			data.items[i].totalPrice = totalPrice;
			data.items[i].totalPriceWithVat = totalPriceWithVat;
			data.items[i].vatPercentage = vatPercentage;
			data.items[i].vat = vat;

			summary.vatSum += vat;
			summary.priceTotalSum += totalPrice;
			summary.priceTotalWithVatSum += totalPriceWithVat;

			let vatInfo = summary.vat.get(vatPercentage)
			if (vatInfo) {
				vatInfo.totalPrice += totalPrice;
				vatInfo.totalPriceWithVat += totalPriceWithVat;
				vatInfo.totalVat += vat
			} else {
				vatInfo = {
					totalPrice: totalPrice,
					totalPriceWithVat: totalPriceWithVat,
					totalVat: vat
				};
			}
			summary.vat.set(vatPercentage, vatInfo);
		}

		summary.vat = new Map([...summary.vat.entries()].sort());

		data.summary = summary;
		console.log("RECALCULATED", data);
		console.log("Checksum: ", hash(data));
		return data;
	};

	modifiedJson = (json, replaced) => {
		const jsonClone = Json.clone(json);
		for (let k in json) {
			if (typeof json[k] === 'object' && json[k] !== null) {
				jsonClone[k] = this.modifiedJson(json[k], replaced)
			} else if (json.hasOwnProperty(k)) {
				jsonClone[k] = replaced(json[k]);
			}
		}
		return jsonClone;
	}

	templated = (expression, constants) => {
		const templateMatcher = /{{\s*([^\s]+?)\s*}}/g;
		const todayMatcher = /today([+-]\d+)/g;
		return expression.toString().replace(templateMatcher, (substring, value) => {
			const todayGroups = this.getGroups(todayMatcher, substring);
			if (todayGroups.length > 0) {
				const daysToAdd = parseInt(todayGroups[0]);
				const dueDate = new Date(constants.today);
				dueDate.setDate(dueDate.getDate() + daysToAdd);
				value = dateFormat(new Date(dueDate), "yyyy-mm-dd");
			} else {
				value = constants[value];
			}
			return value;
		});
	}
}

export default Invoice;