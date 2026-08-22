const studentService = require("./student.service");
const { sendSuccess, sendError, sendCreated } = require("../../utils/response");
const { AppError } = require("../../utils/helpers");

class StudentController {
  /**
   * Create a new student.
   * - `studentId` is auto‑generated (removed from request).
   * - `registrationNumber` must be provided by the user (required and unique).
   */
  async createStudent(req, res, next) {
    try {
      const studentData = req.body;

      // Never allow manual setting of the auto‑generated studentId
      delete studentData.studentId;

      // Ensure registrationNumber is present – schema will enforce, but we can pre‑validate
      if (!studentData.registrationNumber) {
        throw new AppError("Registration number is required", 400);
      }

      studentData.createdBy = req.user._id;

      const student = await studentService.createStudent(studentData);

      return sendCreated(res, {
        message: "Student created successfully",
        student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all students with pagination, filtering, and search.
   */
  async getAllStudents(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        grade,
        section,
        status,
        fromDate,
        toDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const filters = { search, grade, section, status, fromDate, toDate };
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };

      const result = await studentService.getAllStudents(filters, options);

      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a student by MongoDB ObjectId.
   */
  async getStudentById(req, res, next) {
    try {
      const { id } = req.params;
      const student = await studentService.getStudentById(id);

      return sendSuccess(res, { student });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a student by their manually‑provided registration number.
   * Useful for lookups by the user‑facing ID.
   */
  async getStudentByRegistrationNumber(req, res, next) {
    try {
      const { registrationNumber } = req.params;
      if (!registrationNumber) {
        throw new AppError("Registration number is required", 400);
      }

      const student =
        await studentService.getStudentByRegistrationNumber(registrationNumber);

      return sendSuccess(res, { student });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a student.
   * Optionally prevent updates to immutable fields like `studentId` and `registrationNumber`.
   * Uncomment the block below if you want to enforce immutability.
   */
  async updateStudent(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Optional: Prevent updating these identifiers after creation
      // if (updates.studentId) delete updates.studentId;
      // if (updates.registrationNumber) delete updates.registrationNumber;

      updates.updatedBy = req.user._id;

      const student = await studentService.updateStudent(id, updates);

      return sendSuccess(res, {
        message: "Student updated successfully",
        student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft‑delete a student (sets isDeleted = true).
   */
  async deleteStudent(req, res, next) {
    try {
      const { id } = req.params;
      await studentService.deleteStudent(id);

      return sendSuccess(res, {
        message: "Student deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Permanently remove a student from the database.
   */
  async permanentlyDeleteStudent(req, res, next) {
    try {
      const { id } = req.params;
      await studentService.permanentlyDeleteStudent(id);

      return sendSuccess(res, {
        message: "Student permanently deleted",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore a soft‑deleted student.
   */
  async restoreStudent(req, res, next) {
    try {
      const { id } = req.params;
      const student = await studentService.restoreStudent(id);

      return sendSuccess(res, {
        message: "Student restored successfully",
        student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload a photo for a student.
   */
  async uploadPhoto(req, res, next) {
    try {
      const { id } = req.params;

      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      const photoPath = req.file.path;
      const student = await studentService.uploadPhoto(id, photoPath);

      return sendSuccess(res, {
        message: "Photo uploaded successfully",
        student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export students in JSON, CSV, or PDF format.
   */
  async exportStudents(req, res, next) {
    try {
      const { format = "json", ...filters } = req.query;
      const data = await studentService.exportStudents(filters, format);

      // Set appropriate headers
      const contentTypes = {
        json: "application/json",
        csv: "text/csv",
        pdf: "application/pdf",
      };
      const extensions = {
        json: "json",
        csv: "csv",
        pdf: "pdf",
      };

      res.setHeader("Content-Type", contentTypes[format] || "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=students.${extensions[format] || "json"}`,
      );

      res.send(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student statistics (e.g., counts by grade, status, etc.).
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await studentService.getStatistics();

      return sendSuccess(res, { statistics: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk import students from an uploaded file.
   */
  async importStudents(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      const results = await studentService.importStudents(
        req.file.path,
        req.user._id,
      );

      return sendCreated(res, {
        message: "Students imported successfully",
        results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all students belonging to a specific grade.
   */
  async getStudentsByGrade(req, res, next) {
    try {
      const { grade } = req.params;
      const students = await studentService.getStudentsByGrade(grade);

      return sendSuccess(res, {
        students,
        count: students.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search students by name, ID, registration number, email, phone, etc.
   */
  async searchStudents(req, res, next) {
    try {
      const { q } = req.query;

      if (!q) {
        throw new AppError("Search term is required", 400);
      }

      const students = await studentService.searchStudents(q);

      return sendSuccess(res, {
        students,
        count: students.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk promote students from one grade to another for a new academic year.
   */
  async promoteStudents(req, res, next) {
    try {
      const { grade, newGrade, academicYear, status = "active" } = req.body;

      if (!grade || !newGrade || !academicYear) {
        throw new AppError(
          "grade, newGrade, and academicYear are required",
          400,
        );
      }

      const result = await studentService.promoteStudents({
        grade,
        newGrade,
        academicYear,
        status,
      });

      return sendSuccess(res, result, "Students promoted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk mark students as failed for a given grade and academic year.
   */
  async failStudents(req, res, next) {
    try {
      const { grade, academicYear, status = "failed" } = req.body;

      if (!grade || !academicYear) {
        throw new AppError("grade and academicYear are required", 400);
      }

      const result = await studentService.failStudents({
        grade,
        academicYear,
        status,
      });

      return sendSuccess(res, result, "Students marked as failed");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
