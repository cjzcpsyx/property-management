export default (req, res) => {
  // Open Chrome DevTools to step through the debugger!
  // debugger;
  res.status(200).json({ name: 'Hello, world!' });
};

const { PDFDocument } = require('pdfplumber');
const { google } = require('googleapis');

const drive = google.drive({
  version: 'v3',
  auth: new google.auth.OAuth2(),
});

async function splitPdf(fileId, text) {
  // Load the PDF file from Google Drive.
  const request = {
    method: 'GET',
    path: `files/${fileId}`,
  };

  const response = await drive.files.request(request);

  const pdfContent = response.data.content;

  // Create a PDFDocument object from the PDF content.
  const pdfDocument = new PDFDocument();
  pdfDocument.load(pdfContent);

  // Get the list of pages in the PDF file.
  const pages = pdfDocument.getNumberOfPages();

  // Create a list of pages that contain the specified text.
  const pagesWithText = [];
  for (let i = 0; i < pages; i++) {
    const pageText = pdfDocument.getPage(i).extract_text();
    if (text in pageText) {
      pagesWithText.push(i);
    }
  }

  // Split the PDF file at the pages that contain the specified text.
  for (const pageNumber of pagesWithText) {
    const splitPdfPath = `${fileId}_split_${pageNumber + 1}.pdf`;
    const pdfWriter = new PDFDocument();
    pdfWriter.addPage(pdfDocument.getPage(pageNumber));
    pdfWriter.save(splitPdfPath);
  }
}
