import React from 'react';
import JSPDF from "jspdf";
import consolas from "./Consolas";
import dateFormat from "dateformat";

import hash from "object-hash";

class GenerateButton extends React.Component {
	
	render() {
		return <div>
			<button onClick={this.generate}>Generate invoice</button>
		</div>;
	}

	generate = (event) => {
		event.preventDefault();

		const fontSmall = 9;
		const fontBig = 14;

		const doc = new JSPDF('p', 'pt');
		const data = this.props.data;

		console.log("Checksum: ", hash(data));

		const qrCodeCanvas = document.querySelectorAll("[data-qr=qr-name]")[0];
		const qrCodeDataUri = qrCodeCanvas.toDataURL("image/png");

		const LEFT = 60;
		const RIGHT = LEFT + 290;
		const TOP = 40;
		const TAB = 16;
		const LEFT_TAB = LEFT + TAB;
		const RIGHT_ALIGN_BASE = 450;

		const rowGap = 20;
		const rowSize = 16;

		let dateOfIssue = data.paymentTerms.dateOfIssue ? new Date(data.paymentTerms.dateOfIssue) : new Date();
		let dateOfTaxableSupply = data.paymentTerms.dateOfTaxableSupply ? new Date(data.paymentTerms.dateOfTaxableSupply) : new Date();

		doc.addFileToVFS('consolas-normal.ttf', consolas.normal);
		doc.addFileToVFS('consolas-bold.ttf', consolas.bold);
		doc.addFont('consolas-normal.ttf', "Consolas", "normal");
		doc.addFont('consolas-bold.ttf', "Consolas", "bold");
		doc.setFont('Consolas');

		const invoiceLabel = "Faktura č. " + data.label;
		doc.setFontSize(24);
		doc.setFontType('bold');
		doc.text(LEFT, TOP + rowGap + 24, invoiceLabel);
		doc.setFontType('normal');

		if (data.summary.hasVat) {
			doc.setFontSize(fontSmall);
			doc.text(LEFT_TAB, TOP + rowGap + 40, "Daňový doklad");
		}

		const subjectsData = [
			{fontType: 'normal', value: (source) => source.label},
			{fontType: 'normal', value: (source) => source.addressLine1},
			{fontType: 'normal', value: (source) => source.addressLine2},
			{fontType: 'bold', value: (source) => source.identifierPrefix + ": " + source.identifier}
		]

		subjectsData.push({
				fontType: 'bold', value: (source, checkVat) => (
						checkVat === true ?
							!!source.vatIdentifierPrefix && !!source.vatIdentifier && data.summary.hasVat ?
								source.vatIdentifierPrefix + ": " + source.vatIdentifier
							: ""
						:
							!!source.vatIdentifierPrefix && !!source.vatIdentifier ?
								source.vatIdentifierPrefix + ": " + source.vatIdentifier
							: ""
				)});

		subjectsData.push(
			{fontType: 'normal', value: () => ""},
			{fontType: 'normal', value: (source) => source.noteLine1},
			{fontType: 'normal', value: (source) => source.noteLine2}
		);

		const subjectsBase = TOP + rowGap + 64 + 16;
		doc.setFontType('bold');
		doc.setFontSize(fontBig);
		doc.text(LEFT, subjectsBase, "Dodavatel:");
		doc.text(RIGHT, subjectsBase, "Odběratel:");
		doc.setFontSize(fontSmall);

		for (let i = 0; i < subjectsData.length; i++) {
			const y = subjectsBase + (i + 1) * rowSize;
			doc.setFontType(subjectsData[i].fontType);
			doc.text(LEFT_TAB, y, subjectsData[i].value(data.sender, true));
			doc.text(RIGHT + TAB, y, subjectsData[i].value(data.billTo, false));
		}

		let dueDate = new Date(data.paymentTerms.dueDate);

		const paymentBase = TOP + subjectsBase + subjectsData.length * rowSize;
		doc.setFontType('bold');
		doc.setFontSize(fontBig);
		doc.text(LEFT, paymentBase, "Platební podmínky:");
		doc.setFontType('normal');
		doc.setFontSize(fontSmall);

		const infoData = [
			{fontType: 'normal', label: "Číslo účtu", value: data.paymentTerms.accountNumber + "/" + data.paymentTerms.bankCode},
			{fontType: 'normal', label: "Banka", value: data.paymentTerms.bankName},
			{fontType: 'normal', label: "Variabilní symbol", value: data.paymentTerms.variableSymbol},
			{fontType: 'normal', label: "Způsob úhrady", value: data.paymentTerms.paymentType}
		]
		const infoDataDateOfIssue = {
			fontType: 'normal', label: "Datum vystavení", value: dateFormat(dateOfIssue, "dd.mm.yyyy")
		};

		if (data.summary.hasVat) {
			const infoDataDateOfTaxableSupply = {
				fontType: 'normal',
				label: "Datum uskutečnění zdanitelného plnění",
				value: dateFormat(dateOfTaxableSupply, "dd.mm.yyyy")
			};
			if (dateOfIssue > dateOfTaxableSupply) {
				infoData.push(infoDataDateOfTaxableSupply, infoDataDateOfIssue);
			} else {
				infoData.push(infoDataDateOfIssue, infoDataDateOfTaxableSupply);
			}
		} else {
			infoData.push(infoDataDateOfIssue);
		}

		infoData.push({fontType: 'bold', label: "Datum splatnosti", value: dateFormat(dueDate, "dd.mm.yyyy")});


		const rightColumn = 250;
		for (let i = 0; i < infoData.length; i++) {
			doc.setFontType(infoData[i].fontType);
			doc.text(LEFT_TAB, paymentBase + (i + 1) * rowSize, infoData[i].label);
			doc.text(LEFT_TAB + rightColumn, paymentBase + (i + 1) * rowSize, infoData[i].value, {align: "right"});
		}

		doc.setFontType('bold');
		doc.setFontSize(fontBig);
		doc.text(RIGHT, paymentBase, "QR platba:");
		doc.addImage(qrCodeDataUri, "PNG", RIGHT + TAB, paymentBase + 8, 159, 159);

		const itemsData = [
			{x: 0, label: "Název položky"},
			{x: RIGHT_ALIGN_BASE - 325, label: "Množsví"},
			{x: RIGHT_ALIGN_BASE - 255, label: "Cena za mj."}
		];

		if (data.summary.hasVat) {
			itemsData.push(
				{x: RIGHT_ALIGN_BASE - 210, label: "% DPH"},
				{x: RIGHT_ALIGN_BASE - 140, label: "Bez DPH"},
				{x: RIGHT_ALIGN_BASE - 70, label: "DPH"}
			);
		}
		itemsData.push({x: RIGHT_ALIGN_BASE, label: "Celkem"});


		const invoiceBase = TOP + paymentBase + 10 * rowSize;
		doc.setFontType('bold');
		doc.setFontSize(fontBig);
		doc.text(LEFT, invoiceBase, "Fakturace za dodané služby:");

		doc.setFontSize(fontSmall);
		doc.text(LEFT_TAB + itemsData[0].x, invoiceBase + rowSize, itemsData[0].label);
		for (let i = 1; i < itemsData.length; i++) {
			doc.text(LEFT_TAB + itemsData[i].x, invoiceBase + rowSize, itemsData[i].label, {align: "right"});
		}

		doc.setFontType('normal');
		for (let i = 0; i < data.items.length; i++) {

			let vat = this.asCurrency(data.items[i].vat);
			let price = this.asCurrency(data.items[i].price);
			let amount = this.asLabeledNumber(data.items[i].amount, data.items[i].amountLabel);
			let vatPercentage = this.asPercentage(data.items[i].vatPercentage);
			let totalPrice = this.asCurrency(data.items[i].totalPrice);
			let totalPriceWithVat = this.asCurrency(data.items[i].totalPriceWithVat);

			if (data.items[i].totalPriceWithVat === 0) {
				vat = "";
				price = "";
				amount = "";
				vatPercentage = "";
				totalPrice = "";
				totalPriceWithVat = "Zdarma";
			}

			const y = invoiceBase + rowSize * (i + 2);
			doc.text(LEFT_TAB + itemsData[0].x, y, data.items[i].label);
			doc.text(LEFT_TAB + itemsData[1].x, y, String(amount), {align: "right"});
			doc.text(LEFT_TAB + itemsData[2].x, y, String(price), {align: "right"});
			if (!data.summary.hasVat) {
				doc.text(LEFT_TAB + itemsData[3].x, y, totalPriceWithVat, {align: "right"});
			} else {
				doc.text(LEFT_TAB + itemsData[3].x, y, String(vatPercentage), {align: "right"});
				doc.text(LEFT_TAB + itemsData[4].x, y, String(totalPrice), {align: "right"});
				doc.text(LEFT_TAB + itemsData[5].x, y, String(vat), {align: "right"});
				doc.text(LEFT_TAB + itemsData[6].x, y, totalPriceWithVat, {align: "right"});
			}
		}

		/////

		const vatData = [
			{x: RIGHT_ALIGN_BASE - 210, label: "Sazba"},
			{x: RIGHT_ALIGN_BASE - 140, label: "Základ"},
			{x: RIGHT_ALIGN_BASE - 70, label: "DPH"},
			{x: RIGHT_ALIGN_BASE, label: "Včetně DPH"}
		]

		let formattedPriceTotalWithVatSum = this.asCurrency(data.summary.priceTotalWithVatSum);

		let summaryOffset = 0;
		const vatBase = TOP + invoiceBase + rowSize * (data.items.length);
		if (data.summary.hasVat) {

			summaryOffset++;

			doc.setFontType('bold');
			for (let i = 0; i < vatData.length; i++) {
				doc.text(LEFT_TAB + vatData[i].x, vatBase + rowSize * summaryOffset, vatData[i].label, {align: "right"});
			}

			summaryOffset++;

			doc.setFontType('normal');
			for (let [percentage, vatItem] of data.summary.vat) {
				let i = 0;
				doc.text(LEFT_TAB + vatData[i++].x, vatBase + rowSize * summaryOffset, this.asPercentage(percentage), {align: "right"});
				doc.text(LEFT_TAB + vatData[i++].x, vatBase + rowSize * summaryOffset, this.asCurrency(vatItem.totalPrice), {align: "right"});
				doc.text(LEFT_TAB + vatData[i++].x, vatBase + rowSize * summaryOffset, this.asCurrency(vatItem.totalVat), {align: "right"});
				doc.text(LEFT_TAB + vatData[i++].x, vatBase + rowSize * summaryOffset, this.asCurrency(vatItem.totalPriceWithVat), {align: "right"});
				summaryOffset++;
			}
		}

		summaryOffset += 2;
		const summaryBase = vatBase + rowSize * summaryOffset;
		doc.setFontType('bold');
		doc.setFontSize(fontBig);
		doc.text(LEFT, summaryBase, "Celkem k úhradě:");
		doc.text(LEFT_TAB + RIGHT_ALIGN_BASE, summaryBase, formattedPriceTotalWithVatSum, {align: "right"});

		doc.setFontType('normal');
		doc.setFontSize(fontSmall);
		doc.text(LEFT_TAB, summaryBase + rowSize * 2, data.noteLine);

		const documentName = data.configuration.documentName ? data.configuration.documentName : invoiceLabel;
		doc.save(documentName + '.pdf');
	}

	asNumber = (amount) => parseFloat(String(amount)).toLocaleString('cs');
	asCurrency = (amount) => this.asLabeledNumber(amount, "Kč");
	asPercentage = (amount) => this.asLabeledNumber(amount, "%");
	asLabeledNumber = (amount, label) => label ? this.asNumber(amount) + " " + label : this.asNumber(amount);
}

export default GenerateButton;