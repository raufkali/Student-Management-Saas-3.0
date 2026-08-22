const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Generate PDF from HTML-like content
const generatePDF = async (options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        title = "Document",
        subtitle = "",
        data = [],
        columns = [],
        headers = [],
        footer = "",
        landscape = false,
        pageSize = "A4",
        margin = 50,
        filename = `document-${Date.now()}.pdf`,
      } = options;

      const doc = new PDFDocument({
        size: pageSize,
        layout: landscape ? "landscape" : "portrait",
        margin: margin,
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add header
      if (title) {
        doc
          .fontSize(20)
          .font("Helvetica-Bold")
          .text(title, { align: "center" })
          .moveDown(0.5);
      }

      if (subtitle) {
        doc
          .fontSize(14)
          .font("Helvetica")
          .text(subtitle, { align: "center" })
          .moveDown(0.5);
      }

      // Add date
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Generated: ${new Date().toLocaleString()}`, { align: "right" })
        .moveDown();

      // If data is provided, create a table
      if (data && data.length > 0) {
        const tableHeaders =
          columns.length > 0 ? columns : Object.keys(data[0]);
        const tableData = data.map((item) => {
          return tableHeaders.map((header) => {
            // Handle nested objects
            const value = header
              .split(".")
              .reduce((obj, key) => obj?.[key], item);
            return value !== undefined && value !== null ? String(value) : "";
          });
        });

        // Calculate column widths
        const pageWidth = doc.page.width - margin * 2;
        const colWidth = pageWidth / tableHeaders.length;

        // Draw table headers
        let y = doc.y;
        const headerY = y;

        doc.font("Helvetica-Bold").fontSize(10);

        tableHeaders.forEach((header, i) => {
          doc.text(header, margin + i * colWidth, headerY, {
            width: colWidth,
            align: "left",
          });
        });

        // Draw header underline
        y = headerY + 15;
        doc
          .moveTo(margin, y)
          .lineTo(margin + pageWidth, y)
          .stroke()
          .moveDown(0.5);

        // Draw table data
        doc.font("Helvetica").fontSize(9);

        tableData.forEach((row, rowIndex) => {
          const rowY = y + 20 + rowIndex * 20;

          // Check if we need a new page
          if (rowY > doc.page.height - 50) {
            doc.addPage();
            y = 50;

            // Redraw headers on new page
            const newHeaderY = y;
            doc.font("Helvetica-Bold").fontSize(10);

            tableHeaders.forEach((header, i) => {
              doc.text(header, margin + i * colWidth, newHeaderY, {
                width: colWidth,
                align: "left",
              });
            });

            y = newHeaderY + 15;
            doc
              .moveTo(margin, y)
              .lineTo(margin + pageWidth, y)
              .stroke()
              .moveDown(0.5);

            doc.font("Helvetica").fontSize(9);
          }

          // Draw row data
          row.forEach((value, i) => {
            doc.text(value, margin + i * colWidth, y + 20 + rowIndex * 20, {
              width: colWidth,
              align: "left",
            });
          });

          // Draw row separator
          if (rowIndex < tableData.length - 1) {
            const lineY = y + 35 + rowIndex * 20;
            doc
              .moveTo(margin, lineY)
              .lineTo(margin + pageWidth, lineY)
              .stroke("#eee");
          }
        });

        // Update y position
        y = y + 20 + tableData.length * 20;
        doc.moveDown();
      }

      // Add footer
      if (footer) {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(footer, margin, doc.page.height - margin - 20, {
            align: "center",
          });
      }

      // Add page numbers
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .text(
            `Page ${i + 1} of ${totalPages}`,
            margin,
            doc.page.height - margin - 10,
            { align: "center" },
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate student report PDF
const generateStudentReportPDF = async (student) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdfData = Buffer.concat(buffers);
    return pdfData;
  });

  // Add logo/header
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("Student Report", { align: "center" })
    .moveDown();

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Student ID: ${student.studentId}`)
    .text(`Name: ${student.firstName} ${student.lastName}`)
    .text(`Grade: ${student.grade}`)
    .text(`Section: ${student.section || "N/A"}`)
    .text(
      `Date of Birth: ${new Date(student.dateOfBirth).toLocaleDateString()}`,
    )
    .text(`Gender: ${student.gender}`)
    .text(`Nationality: ${student.nationality}`)
    .moveDown();

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Contact Information")
    .moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Email: ${student.email}`)
    .text(`Phone: ${student.phone}`)
    .text(
      `Address: ${student.address ? student.address.city : "N/A"}, ${student.address ? student.address.state : "N/A"}`,
    )
    .moveDown();

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Guardian Information")
    .moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Father: ${student.fatherName || "N/A"}`)
    .text(`Father's Phone: ${student.fatherPhone || "N/A"}`)
    .text(`Mother: ${student.motherName || "N/A"}`)
    .text(`Mother's Phone: ${student.motherPhone || "N/A"}`)
    .moveDown();

  // Add footer
  doc
    .fontSize(10)
    .text(
      `Generated on: ${new Date().toLocaleString()}`,
      50,
      doc.page.height - 50,
    );

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
  });
};

// Save PDF to file
const savePDF = async (pdfData, filePath) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFile(filePath, pdfData, (err) => {
      if (err) reject(err);
      resolve(filePath);
    });
  });
};

module.exports = {
  generatePDF,
  generateStudentReportPDF,
  savePDF,
};
