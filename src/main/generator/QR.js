import React from 'react';
import QRCode from "qrcode.react";

class QR extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			qr: null
		};
	}

	componentDidMount() {
		const accountNumber = this.props.data.paymentTerms.accountNumber;
		const bankCode = this.props.data.paymentTerms.bankCode;
		const getData = async () => {
			// https://openiban.com/v2/calculate/CZ/0800/3102024103
			const resp = await fetch("https://openiban.com/v2/calculate/CZ/" + bankCode + "/" + accountNumber);
			const json = await resp.json();
			const qr = this.qr(this.props.data, json.iban);
			this.setState({qr: qr});
		};
		getData();
	}

	render() {
		return this.state.qr ? <QRCode data-qr="qr-name" size="384" value={this.state.qr}/> : <h1>LOADING</h1>;
	}

	qr = (data, iban) => {
		const payment = data.summary.priceTotalWithVatSum;
		const recipientName = "RECIPIENT NAME";
		const message = "Test message";
		console.log("qr: ", "SPD*1.0*ACC:" + iban + "*AM:" + payment + "*CC:CZK*MSG:" + message + "*RN:" + recipientName + "*");
		return "SPD*1.0*ACC:" + iban + "*AM:" + payment + "*CC:CZK*MSG:" + message + "*RN:" + recipientName + "*";
	}
}

export default QR;