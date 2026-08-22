const Student = require("./student.model");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Generate student ID
async function generateStudentId() {
  const year = new Date().getFullYear().toString().slice(-2);
  const lastStudent = await Student.findOne(
    { studentId: { $regex: `^STU${year}` } },
    { studentId: 1 },
    { sort: { studentId: -1 } },
  );

  let count = 1;
  if (lastStudent) {
    const lastNumber = parseInt(lastStudent.studentId.slice(-4));
    count = lastNumber + 1;
  }

  return `STU${year}${count.toString().padStart(4, "0")}`;
}

// Format student data for export
function formatStudentForExport(student) {
  return {
    "Student ID": student.studentId,
    "Full Name": `${student.firstName} ${student.lastName}`,
    "First Name": student.firstName,
    "Last Name": student.lastName,
    "Date of Birth": student.dateOfBirth?.toISOString().split("T")[0] || "",
    Gender: student.gender,
    Nationality: student.nationality,
    Email: student.email,
    Phone: student.phone,
    Address: student.address
      ? `${student.address.street || ""}, ${student.address.city || ""}, ${student.address.state || ""} ${student.address.postalCode || ""}, ${student.address.country || ""}`.trim()
      : "",
    Grade: student.grade,
    Section: student.section || "",
    "Roll Number": student.rollNumber || "",
    "Academic Year": student.academicYear,
    "Enrollment Date":
      student.enrollmentDate?.toISOString().split("T")[0] || "",
    Status: student.status,
    "Father's Name": student.fatherName || "",
    "Father's Phone": student.fatherPhone || "",
    "Mother's Name": student.motherName || "",
    "Mother's Phone": student.motherPhone || "",
  };
}

// Generate CSV from students
function generateCSV(students) {
  try {
    const fields = [
      "Student ID",
      "Full Name",
      "First Name",
      "Last Name",
      "Date of Birth",
      "Gender",
      "Nationality",
      "Email",
      "Phone",
      "Address",
      "Grade",
      "Section",
      "Roll Number",
      "Academic Year",
      "Enrollment Date",
      "Status",
      "Father's Name",
      "Father's Phone",
      "Mother's Name",
      "Mother's Phone",
    ];

    const data = students.map((student) => formatStudentForExport(student));
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    console.error("Error generating CSV:", error);
    throw error;
  }
}

// Generate PDF from students
function generatePDF(students, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 50,
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add header
      doc.fontSize(20).text("Student Report", { align: "center" }).moveDown();

      if (options.title) {
        doc.fontSize(14).text(options.title, { align: "center" }).moveDown();
      }

      if (options.subtitle) {
        doc.fontSize(12).text(options.subtitle, { align: "center" }).moveDown();
      }

      // Add date
      doc
        .fontSize(10)
        .text(`Generated: ${new Date().toLocaleString()}`, { align: "right" })
        .moveDown();

      // Add table headers
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Grade",
        "Section",
        "Status",
        "Enrollment Date",
      ];

      const tableTop = 150;
      const tableLeft = 50;
      const colWidths = [60, 100, 120, 80, 60, 60, 70, 80];

      // Draw header row
      let x = tableLeft;
      let y = tableTop;

      doc.font("Helvetica-Bold").fontSize(10);

      headers.forEach((header, i) => {
        doc.text(header, x, y, {
          width: colWidths[i],
          align: "left",
        });
        x += colWidths[i];
      });

      // Draw header underline
      doc
        .moveTo(tableLeft, y + 15)
        .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), y + 15)
        .stroke();

      // Draw data rows
      doc.font("Helvetica").fontSize(9);

      students.forEach((student, index) => {
        const data = formatStudentForExport(student);
        const rowY = y + 20 + index * 20;

        // Check if we need a new page
        if (rowY > doc.page.height - 50) {
          doc.addPage();
          y = 50;
          // Redraw headers on new page
          // ...
        }

        x = tableLeft;
        const rowData = [
          data["Student ID"] || "",
          data["Full Name"] || "",
          data["Email"] || "",
          data["Phone"] || "",
          data["Grade"] || "",
          data["Section"] || "",
          data["Status"] || "",
          data["Enrollment Date"] || "",
        ];

        rowData.forEach((value, i) => {
          doc.text(value.toString(), x, rowY, {
            width: colWidths[i],
            align: "left",
          });
          x += colWidths[i];
        });

        // Draw separator line
        if (index < students.length - 1) {
          doc
            .moveTo(tableLeft, rowY + 15)
            .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), rowY + 15)
            .stroke("#eee");
        }
      });

      // Add footer
      const footerY = doc.page.height - 50;
      doc
        .fontSize(8)
        .text(
          `Total Students: ${students.length} | Page ${doc.pageNumber}`,
          tableLeft,
          footerY,
          { align: "center" },
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Calculate student age
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

// Validate student data
function validateStudentData(data) {
  const errors = [];

  // Required fields
  const requiredFields = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "nationality",
    "email",
    "phone",
    "grade",
    "academicYear",
    "fatherName",
    "fatherPhone",
    "motherName",
  ];

  requiredFields.forEach((field) => {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  });

  // Email validation
  if (
    data.email &&
    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)
  ) {
    errors.push("Invalid email format");
  }

  // Phone validation
  if (data.phone && !/^\+?[\d\s-]{10,}$/.test(data.phone)) {
    errors.push("Invalid phone number");
  }

  // Date validation
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push("Invalid date of birth");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Sanitize student data
function sanitizeStudentData(data) {
  const sanitized = { ...data };

  // Trim string fields
  const stringFields = [
    "firstName",
    "lastName",
    "nationality",
    "religion",
    "email",
    "phone",
    "grade",
    "section",
    "rollNumber",
    "academicYear",
    "fatherName",
    "fatherOccupation",
    "fatherPhone",
    "fatherEmail",
    "motherName",
    "motherOccupation",
    "motherPhone",
    "motherEmail",
    "guardianAddress",
    "scholarship",
    "medicalConditions",
    "specialNeeds",
    "notes",
  ];

  stringFields.forEach((field) => {
    if (sanitized[field] && typeof sanitized[field] === "string") {
      sanitized[field] = sanitized[field].trim();
    }
  });

  // Normalize email
  if (sanitized.email) {
    sanitized.email = sanitized.email.toLowerCase();
  }

  // Convert date strings to Date objects
  if (sanitized.dateOfBirth) {
    sanitized.dateOfBirth = new Date(sanitized.dateOfBirth);
  }

  if (sanitized.enrollmentDate) {
    sanitized.enrollmentDate = new Date(sanitized.enrollmentDate);
  }

  return sanitized;
}

module.exports = {
  generateStudentId,
  formatStudentForExport,
  generateCSV,
  generatePDF,
  calculateAge,
  validateStudentData,
  sanitizeStudentData,
};
