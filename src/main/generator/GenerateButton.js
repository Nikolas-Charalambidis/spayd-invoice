import React from 'react';
import jsPDF from "jspdf";
import consolas from "./Consolas";
import dateFormat from "dateformat";

class GenerateButton extends React.Component {

	render() {
		return <div>
			<button onClick={this.generate}>Generate invoice</button>
		</div>
	}

	generate = event => {
		event.preventDefault();

		const data = this.props.data;
		const qrCodeCanvas = document.querySelectorAll("[data-qr=qr-name]")[0];
		const qrCodeDataUri = qrCodeCanvas.toDataURL("image/png");

		var doc = new jsPDF('p', 'pt');

		const LEFT = 60;
		const RIGHT = LEFT + 290;
		const UP = 50;
		const TAB = 16;

		const rowGap = 20;
		const rowSize = 16;
		const subjectsBase = rowGap + 64;

		var dateOfIssue = data.paymentTerms.dateOfIssue ? new Date(data.paymentTerms.dateOfIssue) : new Date();
		var dueDate = new Date(dateOfIssue);
		dueDate.setDate(dueDate.getDate() + parseInt(data.paymentTerms.paymentPeriodInDays));

		doc.addFileToVFS('consolas-normal.ttf', consolas.normal);

		doc.addFileToVFS('consolas-bold.ttf', consolas.bold);
		doc.addFont('consolas-normal.ttf', 'Consolas', 'normal');

		doc.addFont('consolas-bold.ttf', 'Consolas', 'bold');

		doc.setFont('Consolas');
		doc.setFontSize(24);
		doc.setFontType('bold');

		const invoiceNumberBase = data.configuration.dateInId ? dateFormat(dateOfIssue, "yyyymmdd-") : "";
		const invoiceLabel = "Faktura č. " + invoiceNumberBase + data.id;
		doc.text(LEFT, UP + rowGap + 24, invoiceLabel);

		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(LEFT, UP + subjectsBase, 'Dodavatel:');
		doc.setFontSize(10);
		doc.text(LEFT + TAB, UP + subjectsBase + 1 * rowSize, data.sender.label);
		doc.setFontType('normal');
		doc.text(LEFT + TAB, UP + subjectsBase + 2 * rowSize, data.sender.addressLine1);
		doc.text(LEFT + TAB, UP + subjectsBase + 3 * rowSize, data.sender.addressLine2);
		doc.setFontType('bold');
		doc.text(LEFT + TAB, UP + subjectsBase + 4 * rowSize, data.sender.identifierPrefix + ": " + data.sender.identifier);
		doc.setFontType('normal');
		doc.text(LEFT + TAB, UP + subjectsBase + 6 * rowSize, data.sender.noteLine1);
		doc.text(LEFT + TAB, UP + subjectsBase + 7 * rowSize, data.sender.noteLine2);

		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(RIGHT, UP + subjectsBase, 'Odběratel:');
		doc.setFontSize(10);
		doc.text(RIGHT + TAB, UP + subjectsBase + 1 * rowSize, data.billTo.label);
		doc.setFontType('normal');
		doc.text(RIGHT + TAB, UP + subjectsBase + 2 * rowSize, data.billTo.addressLine1);
		doc.text(RIGHT + TAB, UP + subjectsBase + 3 * rowSize, data.billTo.addressLine2);
		doc.setFontType('bold');
		doc.text(RIGHT + TAB, UP + subjectsBase + 4 * rowSize, data.billTo.identifierPrefix + ": " + data.billTo.identifier);
		doc.text(RIGHT + TAB, UP + subjectsBase + 5 * rowSize, data.billTo.vatIdentifierPrefix + ": " + data.billTo.varIdentifier);

		const paymentBase = UP + subjectsBase + 7 * rowSize;
		const rightColumn = 116;
		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(LEFT, UP + paymentBase, 'Platební podmínky:');
		doc.setFontType('normal');
		doc.setFontSize(10);
		doc.text(LEFT + TAB, UP + paymentBase + 1 * rowSize, "Číslo účtu");
		doc.text(LEFT + TAB + rightColumn, UP + paymentBase + 1 * rowSize, data.paymentTerms.accountNumber + "/" + data.paymentTerms.bankCode);
		doc.text(LEFT + TAB, UP + paymentBase + 2 * rowSize, "Banka");
		doc.text(LEFT + TAB + rightColumn, UP + paymentBase + 2 * rowSize, data.paymentTerms.bankName);
		doc.text(LEFT + TAB, UP + paymentBase + 3 * rowSize, "Variabilní symbol");
		doc.text(LEFT + TAB + rightColumn, UP + paymentBase + 3 * rowSize, data.paymentTerms.variableSymbol);
		doc.text(LEFT + TAB, UP + paymentBase + 4 * rowSize, "Způsob úhrady");
		doc.text(LEFT + TAB + rightColumn, UP + paymentBase + 4 * rowSize, data.paymentTerms.paymentType);
		doc.text(LEFT + TAB, UP + paymentBase + 5 * rowSize, "Datum vystavení");
		doc.text(LEFT + TAB + rightColumn, UP + paymentBase + 5 * rowSize, dateFormat(dateOfIssue, "dd.mm.yyyy"));
		doc.text(LEFT + TAB, UP + paymentBase + 6 * rowSize, "Datum splatnosti");
		doc.text(LEFT + TAB + rightColumn, UP + paymentBase + 6 * rowSize,  dateFormat(dueDate, "dd.mm.yyyy"));

		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(RIGHT, UP + paymentBase, 'QR platba:');
		doc.addImage(qrCodeDataUri, "PNG", RIGHT, UP + paymentBase + 8, 175, 175);

		const invoiceBase = UP + paymentBase + 10 * rowSize;
		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(LEFT, UP + invoiceBase, 'Fakturace za dodané služby:');
		doc.setFontSize(10);

		const columnPosition = [0, 116, 165, 245, 290, 384];

		doc.text(LEFT + TAB + columnPosition[0], UP + invoiceBase + rowSize, "Název položky");
		doc.text(LEFT + TAB + columnPosition[1], UP + invoiceBase + rowSize, "Množsví");
		doc.text(LEFT + TAB + columnPosition[2], UP + invoiceBase + rowSize, "Cena");
		doc.text(LEFT + TAB + columnPosition[3], UP + invoiceBase + rowSize, "DPH %");
		doc.text(LEFT + TAB + columnPosition[4], UP + invoiceBase + rowSize, "Cena s DPH");
		doc.text(LEFT + TAB + columnPosition[5], UP + invoiceBase + rowSize, "Celkem s DPH");

		doc.setFontType('normal');

		//var priceTotalSum = 0;
		//var priceTotalWithVatSum = 0;

		const items = data.items;
		for (var i=0; i<items.length; i++) {
			//const vatCoef = 1 + data.items[i].vatPercentage / 100;
			//const amount = data.items[i].amount;

			//const currentPrice = data.items[i].pricePerUnit;
			//const currentPriceWithVat = currentPrice * vatCoef;
			//const currentTotalPrice = currentPrice * amount;
			//const currentTotalPriceWithVat = currentPriceWithVat * amount;

			//priceTotalSum += currentTotalPrice;
			//priceTotalWithVatSum += currentTotalPriceWithVat;

			const price = parseFloat(String(data.items[i].price)).toLocaleString('cs') + " Kč";
			const priceWithVat  = parseFloat(String(data.items[i].priceWithVat)).toLocaleString('cs') + " Kč";
			const totalPriceWithVat  = parseFloat(String(data.items[i].totalPriceWithVat)).toLocaleString('cs') + " Kč";
			//const price = parseFloat(String(currentPrice)).toLocaleString('cs') + " Kč";
			//const priceWithVat  = parseFloat(String(currentPrice * vatCoef)).toLocaleString('cs') + " Kč";
			//const priceTotalWithVat  = parseFloat(String(currentPrice * vatCoef  * data.items[i].amount)).toLocaleString('cs') + " Kč";

			doc.text(LEFT + TAB + columnPosition[0], UP + invoiceBase + rowSize * (i + 2), items[i].label);
			doc.text(LEFT + TAB + columnPosition[1], UP + invoiceBase + rowSize * (i + 2), items[i].amount);
			doc.text(LEFT + TAB + columnPosition[2], UP + invoiceBase + rowSize * (i + 2), price);
			doc.text(LEFT + TAB + columnPosition[3], UP + invoiceBase + rowSize * (i + 2), items[i].vatPercentage);
			doc.text(LEFT + TAB + columnPosition[4], UP + invoiceBase + rowSize * (i + 2), priceWithVat);
			doc.text(LEFT + TAB + columnPosition[5] + 66, UP + invoiceBase + rowSize * (i + 2), totalPriceWithVat, {align: "right"});
		}

		//var formattedPriceTotalSum = parseFloat(String(priceTotalSum)).toLocaleString('cs') + " Kč";
		//var formattedPriceTotalWithVatSum = parseFloat(String(priceTotalWithVatSum)).toLocaleString('cs') + " Kč";
		var formattedPriceTotalSum = parseFloat(String(data.summary.priceTotalSum)).toLocaleString('cs') + " Kč";
		var formattedPriceTotalWithVatSum = parseFloat(String(data.summary.priceTotalWithVatSum)).toLocaleString('cs') + " Kč";

		doc.text(LEFT + TAB , UP + invoiceBase + rowSize * (items.length + 2), "----------------------------------------------------------------------------------");
		doc.text(LEFT + TAB + columnPosition[4], UP + invoiceBase + rowSize * (items.length + 3), "Celkem bez DPH");
		doc.text(LEFT + TAB + columnPosition[4], UP + invoiceBase + rowSize * (items.length + 4), "Celkem s DPH");
		doc.text(LEFT + TAB + columnPosition[5] + 66, UP + invoiceBase + rowSize * (items.length + 3), formattedPriceTotalSum, {align: "right"});
		doc.text(LEFT + TAB + columnPosition[5] + 66, UP + invoiceBase + rowSize * (items.length + 4), formattedPriceTotalWithVatSum, {align: "right"});

		const summaryBase = UP + invoiceBase + rowSize * (items.length + 3);
		doc.setFontType('bold');
		doc.setFontSize(16);
		doc.text(LEFT, UP + summaryBase, 'Celkem k úhradě:');
		doc.text(LEFT + TAB + columnPosition[5] + 66, UP + summaryBase, formattedPriceTotalWithVatSum, {align: "right"});

		doc.setFontType('normal');
		doc.setFontSize(10);
		doc.text(LEFT + TAB, UP + summaryBase + rowSize * 2, data.noteLine);

		doc.save(invoiceLabel + '.pdf');
	}
}


export default GenerateButton;