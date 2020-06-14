import React from 'react';
import QRCode from "qrcode.react";

class QR extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			qr: null
		};
	}

	componentDidUpdate(previousProps, previousState, snapshot) {
		if (previousProps !== this.props) {
			this.qr();
		}
	}

	componentDidMount() {
		this.qr();
	}

	render() {
		return this.state.qr ?
			<div>
				<h1>QR code</h1>
				<QRCode data-qr="qr-name" size="384" value={this.state.qr}/>
			</div> :
			<div>
				<h1>...</h1>
			</div>;
	}

	qr() {
		const accountNumber = this.props.data.paymentTerms.accountNumber;
		const bankCode = this.props.data.paymentTerms.bankCode;
		const getData = async () => {
			// https://openiban.com/v2/calculate/CZ/0800/3102024103
			const resp = await fetch("https://openiban.com/v2/calculate/CZ/" + bankCode + "/" + accountNumber);
			const json = await resp.json();

			const recipientName = "RECIPIENT NAME";
			const message = "Test message";
			const qr =  "SPD*1.0" +
				"*ACC:" + json.iban +
				"*AM:" + this.props.data.summary.priceTotalWithVatSum +
				"*CC:CZK" +
				"*MSG:" + message +
				"*RN:" + recipientName +
				"*";
			this.setState({qr});
		};
		getData();
	}
}

export default QR;