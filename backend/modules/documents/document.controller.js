const documentService = require("./document.service");
const {
  sendSuccess,
  sendError,
  sendCreated,
  sendDownload,
} = require("../../utils/response");

class DocumentController {
  // Upload document
  async uploadDocument(req, res, next) {
    try {
      const { studentId, title, description, category, tags } = req.body;

      if (!req.file) {
        return sendError(res, "No file uploaded", 400);
      }

      const documentData = {
        title,
        description,
        category,
        tags: tags ? JSON.parse(tags) : [],
        studentId,
        uploadedBy: req.user._id,
      };

      const document = await documentService.uploadDocument(
        req.file,
        documentData,
      );

      return sendCreated(res, {
        message: "Document uploaded successfully",
        document,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all documents
  async getAllDocuments(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        type,
        studentId,
        fromDate,
        toDate,
      } = req.query;

      const filters = {
        search,
        category,
        type,
        studentId,
        fromDate,
        toDate,
      };

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      };

      const result = await documentService.getAllDocuments(filters, options);

      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Get document by ID
  async getDocumentById(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocumentById(id);

      return sendSuccess(res, {
        document,
      });
    } catch (error) {
      next(error);
    }
  }

  // Download document
  async downloadDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocumentById(id);

      const fileData = await documentService.getDocumentFile(document);

      res.setHeader("Content-Type", document.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.fileName}"`,
      );
      res.setHeader("Content-Length", document.fileSize);

      res.send(fileData);
    } catch (error) {
      next(error);
    }
  }

  // Update document
  async updateDocument(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const document = await documentService.updateDocument(id, updates);

      return sendSuccess(res, {
        message: "Document updated successfully",
        document,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete document
  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      await documentService.deleteDocument(id);

      return sendSuccess(res, {
        message: "Document deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get documents by student
  async getDocumentsByStudent(req, res, next) {
    try {
      const { studentId } = req.params;
      const documents = await documentService.getDocumentsByStudent(studentId);

      return sendSuccess(res, {
        documents,
        count: documents.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get document statistics
  async getStatistics(req, res, next) {
    try {
      const stats = await documentService.getStatistics();

      return sendSuccess(res, {
        statistics: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
