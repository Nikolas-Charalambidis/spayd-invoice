import React from 'react';
import JSPDF from "jspdf";
import consolas from "./Consolas";
import dateFormat from "dateformat";

class GenerateButton extends React.Component {

	render() {
		return <div>
			<button onClick={this.generate}>Generate invoice</button>
		</div>;
	}

	generate = (event) => {
		event.preventDefault();

		const doc = new JSPDF('p', 'pt');
		const data = this.props.data;
		const qrCodeCanvas = document.querySelectorAll("[data-qr=qr-name]")[0];
		const qrCodeDataUri = qrCodeCanvas.toDataURL("image/png");

		const LEFT = 60;
		const RIGHT = LEFT + 290;
		const TOP = 50;
		const TAB = 16;
		const LEFT_TAB = LEFT + TAB;

		const rowGap = 20;
		const rowSize = 16;
		const rightOffset = 66;

		var dateOfIssue = data.paymentTerms.dateOfIssue ? new Date(data.paymentTerms.dateOfIssue) : new Date();

		doc.addFileToVFS('consolas-normal.ttf', consolas.normal);
		doc.addFileToVFS('consolas-bold.ttf', consolas.bold);
		doc.addFont('consolas-normal.ttf', "Consolas", "normal");
		doc.addFont('consolas-bold.ttf', "Consolas", "bold");
		doc.setFont('Consolas');

		const invoiceNumber = data.configuration.label.dateInId ? dateFormat(dateOfIssue, "yyyymmdd-") : "";
		const invoiceLabel = "Faktura č. " + invoiceNumber + data.id;
		doc.setFontSize(24);
		doc.setFontType('bold');
		doc.text(LEFT, TOP + rowGap + 24, invoiceLabel);

		const subjectsBase = TOP + rowGap + 64;
		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(LEFT, subjectsBase, "Dodavatel:");
		doc.setFontSize(10);
		doc.text(LEFT_TAB, subjectsBase + rowSize, data.sender.label);
		doc.setFontType('normal');
		doc.text(LEFT_TAB, subjectsBase + 2 * rowSize, data.sender.addressLine1);
		doc.text(LEFT_TAB, subjectsBase + 3 * rowSize, data.sender.addressLine2);
		doc.setFontType('bold');
		doc.text(LEFT_TAB, subjectsBase + 4 * rowSize, data.sender.identifierPrefix + ": " + data.sender.identifier);
		doc.text(LEFT_TAB, subjectsBase + 5 * rowSize, data.sender.vatIdentifierPrefix + ": " + data.sender.varIdentifier);
		doc.setFontType('normal');
		doc.text(LEFT_TAB, subjectsBase + 6 * rowSize, data.sender.noteLine1);
		doc.text(LEFT_TAB, subjectsBase + 7 * rowSize, data.sender.noteLine2);

		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(RIGHT, subjectsBase, "Odběratel:");
		doc.setFontSize(10);
		doc.text(RIGHT + TAB, subjectsBase + rowSize, data.billTo.label);
		doc.setFontType('normal');
		doc.text(RIGHT + TAB, subjectsBase + 2 * rowSize, data.billTo.addressLine1);
		doc.text(RIGHT + TAB, subjectsBase + 3 * rowSize, data.billTo.addressLine2);
		doc.setFontType('bold');
		doc.text(RIGHT + TAB, subjectsBase + 4 * rowSize, data.billTo.identifierPrefix + ": " + data.billTo.identifier);
		doc.text(RIGHT + TAB, subjectsBase + 5 * rowSize, data.billTo.vatIdentifierPrefix + ": " + data.billTo.varIdentifier);

		var dueDate = new Date(dateOfIssue);
		dueDate.setDate(dueDate.getDate() + parseInt(data.paymentTerms.paymentPeriodInDays));

		const paymentBase = TOP + subjectsBase + 7 * rowSize;
		const rightColumn = 116;
		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(LEFT, paymentBase, "Platební podmínky:");
		doc.setFontType('normal');
		doc.setFontSize(10);

		const infoData = [
			{ label: "Číslo účtu", value: data.paymentTerms.accountNumber + "/" + data.paymentTerms.bankCode},
			{ label: "Banka", value: data.paymentTerms.bankName },
			{ label: "Variabilní symbol", value: data.paymentTerms.variableSymbol },
			{ label: "Způsob úhrady", value: data.paymentTerms.paymentType },
			{ label: "Datum vystavení", value: dateFormat(dateOfIssue, "dd.mm.yyyy") },
			{ label: "Datum splatnosti", value: dateFormat(dueDate, "dd.mm.yyyy") }
		];
		for (let i=0; i<infoData.length; i++) {
			doc.text(LEFT_TAB, paymentBase + (i + 1) * rowSize, infoData[i].label);
			doc.text(LEFT_TAB + rightColumn, paymentBase + (i + 1) * rowSize, infoData[i].value);
		}

		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(RIGHT, paymentBase, "QR platba:");
		doc.addImage(qrCodeDataUri, "PNG", RIGHT, paymentBase + 8, 175, 175);

		const vatValuesArePresent = data.items.filter(item => Number(item.vatPercentage) !== 0).length > 0;

		let hasVat = false;
		const itemsData = [
			{ x: 0,   label: "Název položky" },
			{ x: 116, label: "Množsví" },
			{ x: 165, label: "Cena" }
		];
		if (data.configuration.includeVat || vatValuesArePresent) {
			itemsData.push(
				{ x: 245, label: "DPH %" },
				{ x: 290, label: "Cena s DPH" },
				{ x: 384, label: "Celkem s DPH" }
			);
			hasVat = true;
		} else {
			itemsData.push({ x: 416, label: "Celkem" });
		}

		const invoiceBase = TOP + paymentBase + 10 * rowSize;
		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(LEFT, invoiceBase, "Fakturace za dodané služby:");

		doc.setFontSize(10);
		for (let i=0; i<itemsData.length; i++) {
			console.log("#" + i + ": ", LEFT_TAB + itemsData[i].x + "     " +invoiceBase + rowSize, itemsData[i].label);
			doc.text(LEFT_TAB + itemsData[i].x, invoiceBase + rowSize, itemsData[i].label);
		}

		doc.setFontType('normal');
		const items = data.items;
		for (let i=0; i<items.length; i++) {

			const price = parseFloat(String(data.items[i].price)).toLocaleString('cs') + " Kč";
			const priceWithVat  = parseFloat(String(data.items[i].priceWithVat)).toLocaleString('cs') + " Kč";
			const totalPriceWithVat  = parseFloat(String(data.items[i].totalPriceWithVat)).toLocaleString('cs') + " Kč";

			const y = invoiceBase + rowSize * (i + 2);
			doc.text(LEFT_TAB + itemsData[0].x, y, items[i].label);
			doc.text(LEFT_TAB + itemsData[1].x, y, items[i].amount);
			doc.text(LEFT_TAB + itemsData[2].x, y, price);
			if (!hasVat) {
				doc.text(LEFT_TAB + itemsData[3].x + rightOffset - 32, y, totalPriceWithVat, {align: "right"});
			} else {
				doc.text(LEFT_TAB + itemsData[3].x, y, items[i].vatPercentage);
				doc.text(LEFT_TAB + itemsData[4].x, y, priceWithVat);
				doc.text(LEFT_TAB + itemsData[5].x + rightOffset, y, totalPriceWithVat, {align: "right"});
			}
		}

		var formattedPriceTotalSum = parseFloat(String(data.summary.priceTotalSum)).toLocaleString('cs') + " Kč";
		var formattedPriceTotalWithVatSum = parseFloat(String(data.summary.priceTotalWithVatSum)).toLocaleString('cs') + " Kč";

		var separator;
		switch (data.configuration.separator) {
			case "dash": separator = "—"; break;
			case "underscore": separator = "_"; break;
			case "dot": separator = "."; break;
			case "hyphen": separator = "-"; break;
			default: separator = null;
		}

		let summaryOffset = 0;

		if (separator != null) {
			doc.text(LEFT_TAB , invoiceBase + rowSize * (items.length + 2), separator.repeat(82));
			summaryOffset++;
		}

		if (data.configuration.showSummary) {
			if (hasVat) {
				const yCoeficient = (items.length + 2 + summaryOffset);
				doc.text(LEFT_TAB + 290, invoiceBase + rowSize * yCoeficient, "Celkem bez DPH");
				doc.text(LEFT_TAB + 384 + rightOffset, invoiceBase + rowSize * yCoeficient, formattedPriceTotalSum, {align: "right"});
				summaryOffset++;
			}
			const yCoeficient = (items.length + 2 + summaryOffset);
			doc.text(LEFT_TAB + 290, invoiceBase + rowSize * yCoeficient, "Celkem");
			doc.text(LEFT_TAB + 384 + rightOffset, invoiceBase + rowSize * yCoeficient, formattedPriceTotalWithVatSum, {align: "right"});
		}

		summaryOffset++;
		const summaryBase = TOP + invoiceBase + rowSize * (items.length + summaryOffset);
		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(LEFT, summaryBase, "Celkem k úhradě:");
		doc.text(LEFT_TAB + 384 + rightOffset, summaryBase, formattedPriceTotalWithVatSum, {align: "right"});

		doc.setFontType('normal');
		doc.setFontSize(10);
		doc.text(LEFT_TAB, summaryBase + rowSize * 2, data.noteLine);

		const documentName = data.configuration.documentName ? data.configuration.documentName : invoiceLabel;
		doc.save(documentName + '.pdf');
	}
}


export default GenerateButton;