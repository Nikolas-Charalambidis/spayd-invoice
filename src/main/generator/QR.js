import React from 'react';
import QRCode from "qrcode.react";
import dateFormat from "dateformat";

class QR extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			qr: ""
		};
	}

	componentDidUpdate(previousProps, previousState, snapshot) {
		if (previousProps !== this.props) {
			this.qr()
				.then(qr => this.setState({qr}));
		}
	}

	componentDidMount() {
		this.qr()
			.then(qr => this.setState({qr}));
	}

	render() {
		return this.state.qr ?
			<div>
				<h1>QR code</h1>
				<QRCode data-qr="qr-name" size={384} value={this.state.qr}/>
			</div> :
			<div>
				<h1>...</h1>
			</div>;
	}

	async qr() {
		const accountNumber = this.props.data.paymentTerms.accountNumber;
		const bankCode = this.props.data.paymentTerms.bankCode;
		const getData = async () => {
			// https://openiban.com/v2/calculate/CZ/0800/3102024103
			const resp = await fetch("https://openiban.com/v2/calculate/CZ/" + bankCode + "/" + accountNumber);
			const json = await resp.json();
			const dueDate = this.props.data.paymentTerms.dueDate;

			return "SPD*1.0" +
				"*ACC:" + json.iban +
				"*AM:" + this.props.data.summary.priceTotalWithVatSum + "*CC:CZK" +
				"*MSG:" + this.props.data.paymentTerms.message +
				"*DT:" + dateFormat(dueDate, "yyyymmdd") +
				"*X-VS:" + this.props.data.paymentTerms.variableSymbol +
				"*X-SS:" + this.props.data.paymentTerms.specificSymbol +
				"*X-KS:" + this.props.data.paymentTerms.constantSymbol +
				"*";
		};
		return getData();
	}
}

export default QR;