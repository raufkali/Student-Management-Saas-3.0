const Document = require("./document.model");
const { AppError } = require("../../utils/helpers");
const store = require("../../config/inMemoryStore");
const fs = require("fs");
const path = require("path");
const { UPLOAD_PATH } = require("../../config/env");

class DocumentService {
  async uploadDocument(file, data) {
    const documentData = {
      _id: `doc_${Date.now()}`,
      title: data.title,
      description: data.description,
      category: data.category || "other",
      tags: data.tags || [],
      studentId: data.studentId,
      uploadedBy: data.uploadedBy,
      filePath: file?.path || "",
      fileName: file?.originalname || "document.pdf",
      fileSize: file?.size || 102400,
      mimeType: file?.mimetype || "application/pdf",
      type: this.getDocumentType(file?.mimetype || "application/pdf"),
      createdAt: new Date(),
    };

    store.documents.unshift(documentData);
    return documentData;
  }

  async getAllDocuments(filters = {}, options = {}) {
    const { page = 1, limit = 10 } = options;
    let list = [...store.documents].filter((d) => !d.isDeleted);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((d) => d.title?.toLowerCase().includes(q) || d.fileName?.toLowerCase().includes(q));
    }
    if (filters.category) list = list.filter((d) => d.category === filters.category);
    if (filters.studentId) list = list.filter((d) => d.studentId === filters.studentId);

    const total = list.length;
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    const docs = list.slice((p - 1) * l, p * l);

    return {
      documents: docs,
      pagination: {
        page: p,
        limit: l,
        total,
        pages: Math.ceil(total / l) || 1,
      },
    };
  }

  async getDocumentById(documentId) {
    const doc = store.documents.find((d) => d._id === documentId);
    if (!doc) {
      throw new AppError("Document not found", 404);
    }
    return doc;
  }

  async getDocumentFile(document) {
    if (document.filePath && fs.existsSync(document.filePath)) {
      return fs.readFileSync(document.filePath);
    }
    // Return sample text buffer if file is mock
    return Buffer.from("Sample Document Content");
  }

  async updateDocument(documentId, updates) {
    const doc = store.documents.find((d) => d._id === documentId);
    if (!doc) {
      throw new AppError("Document not found", 404);
    }
    Object.assign(doc, updates);
    return doc;
  }

  async deleteDocument(documentId) {
    const doc = store.documents.find((d) => d._id === documentId);
    if (!doc) {
      throw new AppError("Document not found", 404);
    }
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    return doc;
  }

  async getDocumentsByStudent(studentId) {
    return store.documents.filter((d) => d.studentId === studentId && !d.isDeleted);
  }

  async getStatistics() {
    const valid = store.documents.filter((d) => !d.isDeleted);
    const totalSize = valid.reduce((acc, d) => acc + (d.fileSize || 0), 0);

    return {
      total: valid.length,
      byCategory: [{ _id: "general", count: valid.length }],
      byType: [{ _id: "pdf", count: valid.length }],
      totalSize,
      lastUpdated: new Date(),
    };
  }

  getDocumentType(mimeType) {
    const typeMap = {
      "application/pdf": "pdf",
      "image/jpeg": "image",
      "image/png": "image",
      "image/gif": "image",
      "image/webp": "image",
      "application/msword": "document",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "document",
      "application/vnd.ms-excel": "spreadsheet",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "spreadsheet",
    };
    return typeMap[mimeType] || "other";
  }
}

module.exports = new DocumentService();
