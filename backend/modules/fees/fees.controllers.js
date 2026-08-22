// backend/modules/fees/fees.controllers.js

const FeeStructure = require("./fees.structure.model");
const FeeRecord = require("./fees.record.model");
const Student = require("../students/student.model");
const Setting = require("../settings/setting.model");
const PDFDocument = require("pdfkit");
const store = require("../../config/inMemoryStore");
const { sendSuccess, sendError, sendCreated } = require("../../utils/response");

// ============ FEE STRUCTURE CONTROLLERS ============

exports.createFeeStructure = async (req, res, next) => {
  try {
    const feeStructureData = {
      ...req.body,
      createdBy: req.user?._id || req.user?.id,
    };

    try {
      const feeStructure = await FeeStructure.create(feeStructureData);
      return res.status(201).json({
        success: true,
        message: "Fee structure created successfully",
        data: feeStructure,
      });
    } catch (e) {
      const newStructure = {
        _id: `fs_${Date.now()}`,
        ...feeStructureData,
        createdAt: new Date(),
      };
      store.feeStructures.unshift(newStructure);
      return res.status(201).json({
        success: true,
        message: "Fee structure created successfully",
        data: newStructure,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getAllFeeStructures = async (req, res, next) => {
  try {
    const { grade, academicYear, isActive } = req.query;
    try {
      const filter = {};
      if (grade) filter.grade = grade.toUpperCase();
      if (academicYear) filter.academicYear = academicYear;
      if (isActive !== undefined) filter.isActive = isActive === "true";

      const feeStructures = await FeeStructure.find(filter)
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 });

      if (feeStructures && feeStructures.length > 0) {
        return res.json({
          success: true,
          data: feeStructures,
        });
      }
    } catch (e) {}

    let list = [...store.feeStructures];
    if (grade) list = list.filter((f) => f.grade?.toUpperCase() === grade.toUpperCase());
    if (academicYear) list = list.filter((f) => f.academicYear === academicYear);

    return res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeeStructuresByGrade = async (req, res, next) => {
  try {
    const { grade } = req.params;
    let structures = store.feeStructures.filter(
      (f) => f.grade?.toUpperCase() === grade.toUpperCase(),
    );
    res.json({
      success: true,
      data: structures,
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeeStructureById = async (req, res, next) => {
  try {
    const found = store.feeStructures.find((f) => f._id === req.params.id);
    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }
    res.json({
      success: true,
      data: found,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateFeeStructure = async (req, res, next) => {
  try {
    const index = store.feeStructures.findIndex((f) => f._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }
    store.feeStructures[index] = { ...store.feeStructures[index], ...req.body };
    res.json({
      success: true,
      message: "Fee structure updated successfully",
      data: store.feeStructures[index],
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteFeeStructure = async (req, res, next) => {
  try {
    const index = store.feeStructures.findIndex((f) => f._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }
    store.feeStructures.splice(index, 1);
    res.json({
      success: true,
      message: "Fee structure deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ============ FEE RECORD CONTROLLERS ============

exports.createFeeRecord = async (req, res, next) => {
  try {
    const { studentId, feeItems, totalFee, academicYear, dueDate, notes } = req.body;
    const student = store.students.find((s) => s._id === studentId || s.studentId === studentId);
    
    const newRecord = {
      _id: `fr_${Date.now()}`,
      studentId: student || { _id: studentId, firstName: "Student", lastName: "" },
      studentName: student ? `${student.firstName} ${student.lastName}` : "Student",
      studentClass: student?.grade || "Grade 10",
      academicYear: academicYear || "2025-2026",
      feeItems: feeItems || [],
      totalFee: Number(totalFee) || 0,
      totalPaid: 0,
      totalRemaining: Number(totalFee) || 0,
      status: "pending",
      payments: [],
      dueDate: dueDate || new Date(),
      notes: notes || "",
      createdAt: new Date(),
    };

    store.feeRecords.unshift(newRecord);

    res.status(201).json({
      success: true,
      message: "Fee record created successfully",
      data: newRecord,
    });
  } catch (error) {
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, paymentType, referenceNumber, notes } = req.body;

    const feeRecord = store.feeRecords.find((r) => r._id === id);
    if (!feeRecord) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const amt = Number(amount) || 0;
    const year = new Date().getFullYear().toString().slice(-2);
    const receiptNumber = `REC${year}${Math.floor(100000 + Math.random() * 900000)}`;

    const payment = {
      _id: `pay_${Date.now()}`,
      amount: amt,
      paymentDate: new Date(),
      paymentMethod: paymentMethod || "cash",
      paymentType: paymentType || "tuition",
      referenceNumber: referenceNumber || "",
      receiptNumber,
      notes: notes || "",
      receivedBy: req.user?._id || "admin",
    };

    feeRecord.payments = feeRecord.payments || [];
    feeRecord.payments.push(payment);
    feeRecord.totalPaid = (feeRecord.totalPaid || 0) + amt;
    feeRecord.totalRemaining = Math.max(0, (feeRecord.totalFee || 0) - feeRecord.totalPaid);
    feeRecord.status = feeRecord.totalRemaining === 0 ? "paid" : "partial";

    res.json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        payment,
        feeRecord,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllFeeRecords = async (req, res, next) => {
  try {
    const { status, studentClass, academicYear } = req.query;
    let list = [...store.feeRecords];

    if (status) list = list.filter((r) => r.status === status);
    if (studentClass) list = list.filter((r) => (r.studentClass || r.grade)?.toUpperCase() === studentClass.toUpperCase());
    if (academicYear) list = list.filter((r) => r.academicYear === academicYear);

    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentFeeRecords = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const records = store.feeRecords.filter(
      (r) => r.studentId?._id === studentId || r.studentId === studentId,
    );
    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentBalance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const records = store.feeRecords.filter(
      (r) => r.studentId?._id === studentId || r.studentId === studentId,
    );
    const balance = records.reduce((acc, curr) => acc + (curr.totalRemaining || curr.balanceAmount || 0), 0);
    const student = store.students.find((s) => s._id === studentId || s.studentId === studentId);

    res.json({
      success: true,
      data: {
        studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : "Student",
        outstandingBalance: balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOutstandingFees = async (req, res, next) => {
  try {
    const outstanding = store.feeRecords.filter((r) => r.status !== "paid");
    res.json({
      success: true,
      data: outstanding,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCollectionReport = async (req, res, next) => {
  try {
    const payments = store.feeRecords.flatMap((r) => r.payments || []);
    const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    res.json({
      success: true,
      data: {
        totalCollected,
        paymentCount: payments.length,
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeeRecordById = async (req, res, next) => {
  try {
    const feeRecord = store.feeRecords.find((r) => r._id === req.params.id);
    if (!feeRecord) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }
    res.json({
      success: true,
      data: feeRecord,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateFeeRecord = async (req, res, next) => {
  try {
    const index = store.feeRecords.findIndex((r) => r._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }
    store.feeRecords[index] = { ...store.feeRecords[index], ...req.body };
    res.json({
      success: true,
      message: "Fee record updated successfully",
      data: store.feeRecords[index],
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteFeeRecord = async (req, res, next) => {
  try {
    const index = store.feeRecords.findIndex((r) => r._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }
    store.feeRecords.splice(index, 1);
    res.json({
      success: true,
      message: "Fee record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeeStatistics = async (req, res, next) => {
  try {
    const allRecords = store.feeRecords;
    const allPayments = allRecords.flatMap((r) => r.payments || []);
    const totalCollected = allPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const outstandingRecords = allRecords.filter((r) => r.status !== "paid");
    const outstandingBalance = outstandingRecords.reduce((acc, r) => acc + (r.totalRemaining || r.balanceAmount || 0), 0);
    const overdueRecords = allRecords.filter((r) => r.status === "overdue" || (new Date(r.dueDate) < new Date() && r.status !== "paid"));
    const overdueAmount = overdueRecords.reduce((acc, r) => acc + (r.totalRemaining || r.balanceAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalCollected,
        totalTransactions: allPayments.length,
        outstandingBalance,
        outstandingCount: outstandingRecords.length,
        overdueAmount,
        overdueCount: overdueRecords.length,
        monthlyCollection: totalCollected,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.generateReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feeRecord = store.feeRecords.find((r) => r._id === id) || {
      _id: id,
      studentName: "Student",
      studentClass: "Grade 10",
      academicYear: "2025-2026",
      totalFee: 1800,
      totalPaid: 1800,
      totalRemaining: 0,
      feeItems: [{ name: "Tuition", amount: 1800 }],
      payments: [{ receiptNumber: "REC-2025-001", amount: 1800, paymentMethod: "Cash", paymentType: "Tuition" }],
    };

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=receipt-${id}.pdf`);
      res.send(pdfData);
    });

    doc.fontSize(20).font("Helvetica-Bold").text("Oakridge Global Academy", { align: "center" });
    doc.fontSize(10).font("Helvetica").text("100 Academic Way, Metro City, CA", { align: "center" }).moveDown();
    doc.fontSize(16).font("Helvetica-Bold").text("PAYMENT RECEIPT", { align: "center" }).moveDown();
    doc.fontSize(12).font("Helvetica").text(`Receipt ID: ${id}`).text(`Date: ${new Date().toLocaleDateString()}`).moveDown();
    doc.text(`Student: ${feeRecord.studentName}`).text(`Class: ${feeRecord.studentClass}`).text(`Total Fee: $${feeRecord.totalFee}`).text(`Total Paid: $${feeRecord.totalPaid}`).moveDown();
    doc.text("Thank you for your payment!", { align: "center" });
    doc.end();
  } catch (error) {
    next(error);
  }
};
