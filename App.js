const express = require('express');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const stream = require("stream");
const fs = require('fs');
const fetch = require('cross-fetch');
const app = express();

app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(express.json())

app.get('', (req, res) => {
  res.send('Hello express!')
})

app.post('/afd_pdf', (req, res) => {
  const reqBody = req.body;
  console.log('You provided Customer Name:' + reqBody.CUSTNAME + ', Location:' + reqBody.LOCATION + ', Model:' + reqBody.MODEL
    + ', WordOrder:' + reqBody.WORKORDER + ', Rev:' + reqBody.REV + ', Rel:' + reqBody.REL + ', serail:' + reqBody.SERIAL);

    run().catch(err => console.log(err));

  async function run() {
    const url = reqBody.URL;
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
    const content = await PDFDocument.load(existingPdfBytes);
    const form = content.getForm();
    const nameField = form.getTextField('Master.WORK_ORDER_ASSET_SHIP_TO_CUSTOMER_NAME_FORMULA');
    const locField = form.getTextField('Master.WORK_ORDER_ASSET_SHIPPING_CITY_AND_STATE_FORMULA');
    const prodField = form.getTextField('Master.WORK_ORDER_ASSET_PRODUCT_NAME');
    const workField = form.getTextField('Master.WORK_ORDER_ASSET_WORK_ORDER_WORKORDERNUMBER');
    const revField = form.getTextField('QueryData.PRODUCT_MODEL_REASON_PROCEDURE_REV');
    const relField = form.getTextField('QueryData.PRODUCT_MODEL_REASON_PROCEDURE_RELEASE');
    const serialField = form.getTextField('Master.WORK_ORDER_ASSET_SERIALNUMBER');
    nameField.setText(reqBody.CUSTNAME);
    locField.setText(reqBody.LOCATION);
    prodField.setText(reqBody.MODEL);
    workField.setText(reqBody.WORKORDER);
    revField.setText(reqBody.REV);
    relField.setText(reqBody.REL);
    serialField.setText(reqBody.SERIAL);
    //res.setHeader('Content-disposition', 'attachment; filename=' + reqBody.form + '_' + reqBody.workorder + '.pdf');
    res.setHeader('Content-disposition', 'inline; filename=' + reqBody.FORM + '_' + reqBody.WORKORDER + '.pdf');
    res.setHeader('Content-type', 'application/pdf');
    // Write the PDF to a fil]e
    const pdfBytes = await content.save();
    const readStream = new stream.PassThrough();
    readStream.end(pdfBytes);
    readStream.pipe(res);
  }
})

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log('Server is up on port', port)
})