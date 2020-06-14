[![Build Status](https://travis-ci.org/Nikolas-Charalambidis/qr-spayd-invoice.svg?branch=master)](https://travis-ci.org/Nikolas-Charalambidis/spayd-invoice)

[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Nikolas-Charalambidis/react-hooks/blob/master/LICENSE)

# SPAYD Invoice

The application generates invoice in the Czech language based on the provided data in the JSON format. The invoice contains all the fields a decent invoice should have and a QR payment code which follows the [Short Payment Descriptor](https://en.wikipedia.org/wiki/Short_Payment_Descriptor) (also known as SPAYD or SPD. Not *that* [SPD](https://en.wikipedia.org/wiki/Freedom_and_Direct_Democracy) though - hands out! That's why I prefer *SPAYD* over *SPD*). 

## [https://nikolas-charalambidis.github.io/spayd-invoice/](https://nikolas-charalambidis.github.io/spayd-invoice/)

This web application is based on React and automatically built and deployed via Travis CI to GitHub Pages. If you want to achieve the same, the process is fairly simple and I describe in [React Hooks](https://github.com/Nikolas-Charalambidis/react-hooks).

**Disclaimer**: The default sample JSON is filled with fictional data only , except those: `paymentAccount` and `bankCode` - they are not the mock data and refer to *my* real account open solely for purposes and applications like this.

Here are a few basic scenarios you might want to go through.

## How does it work?

First of all, the application is ready to generate an invoice since the default data are provided on the application start.

### Download a sample JSON

This default JSON can be downloaded for the purpose of additional editing - this tepmlate is a sample and belongs to you, saved at your desktop and steady to be used.

### Upload your JSON

The JSON can be uploaded and the application hence works with new set of data.

### Generate invoice

Click the button to generate the invoice based on the currently loaded data (the default data if no JSON was loaded). The QR code is displayed real-time at the website so you can check whether the code works as intended.

## JSON

The application works rather with JSON than XML. For most human beings JSON format is easier to read and edit (yet I never stop loving XML, which I find very powerful). Unluckily, there is no schema to validate it against. It brings such freedom but also can lead to unpredictable results. The JSON this application works with also contains aside from common fields saying *what* will be generated also configuration fields to indicate *how* it will be displayed.

### Common fields

TO BE DONE

### Configurable fields

As said, they indicate *how* some fields will be displayed in the invoice.

#### `configuration.dateInId
 - Type: `boolean`
 - Values: either `true` or `false` (omitted in that case)
 - Meaning: If the flag is set, the date in the `yyyymmdd` format will be included as a part of the ID of the invoice (ex. `20200614-15`). Otherwise, only true ID will be displayed (ex. `15`).
