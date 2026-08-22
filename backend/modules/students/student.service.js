const Student = require("./student.model");
const { AppError } = require("../../utils/helpers");
const store = require("../../config/inMemoryStore");
const path = require("path");
const fs = require("fs");
const { UPLOAD_PATH } = require("../../config/env");
const { generatePDF } = require("../../utils/pdf");
const { Parser } = require("json2csv");
const XLSX = require("xlsx");

class StudentService {
  async createStudent(studentData) {
    try {
      delete studentData.studentId;
      const student = await Student.create(studentData);
      return student;
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError("Student with this email/phone already exists", 409);
      }
      // In-memory fallback
      store.counter++;
      const idNum = String(store.counter).padStart(3, "0");
      const newStudent = {
        _id: `stu_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        studentId: `STU-2025-${idNum}`,
        registrationNumber: `REG-2025-${idNum}`,
        ...studentData,
        status: studentData.status || "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.students.unshift(newStudent);
      return newStudent;
    }
  }

  async getAllStudents(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    try {
      const query = {};
      if (filters.search) {
        query.$or = [
          { firstName: { $regex: filters.search, $options: "i" } },
          { lastName: { $regex: filters.search, $options: "i" } },
          { studentId: { $regex: filters.search, $options: "i" } },
          { email: { $regex: filters.search, $options: "i" } },
        ];
      }
      if (filters.grade) query.grade = filters.grade;
      if (filters.section) query.section = filters.section;
      if (filters.status) query.status = filters.status;
      query.isDeleted = { $ne: true };

      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      const total = await Student.countDocuments(query);
      const students = await Student.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      if (students && students.length > 0) {
        return {
          students,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit) || 1,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        };
      }
    } catch (error) {
      // fallback to in-memory store
    }

    // In-memory filter
    let list = store.students.filter((s) => !s.isDeleted);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(q) ||
          s.lastName?.toLowerCase().includes(q) ||
          s.studentId?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q),
      );
    }
    if (filters.grade) {
      list = list.filter((s) => s.grade === filters.grade);
    }
    if (filters.section) {
      list = list.filter((s) => s.section === filters.section);
    }
    if (filters.status) {
      list = list.filter((s) => s.status === filters.status);
    }

    const total = list.length;
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    const pagedStudents = list.slice((p - 1) * l, p * l);

    return {
      students: pagedStudents,
      pagination: {
        page: p,
        limit: l,
        total,
        pages: Math.ceil(total / l) || 1,
        hasNextPage: p < Math.ceil(total / l),
        hasPrevPage: p > 1,
      },
    };
  }

  async getStudentById(studentId) {
    try {
      const student = await Student.findById(studentId);
      if (student) return student;
    } catch (e) {}

    const found = store.students.find(
      (s) => s._id === studentId || s.studentId === studentId,
    );
    if (!found) {
      throw new AppError("Student not found", 404);
    }
    return found;
  }

  async updateStudent(studentId, updates) {
    try {
      const updated = await Student.findByIdAndUpdate(
        studentId,
        { $set: updates },
        { new: true, runValidators: true },
      );
      if (updated) return updated;
    } catch (e) {}

    const index = store.students.findIndex(
      (s) => s._id === studentId || s.studentId === studentId,
    );
    if (index === -1) {
      throw new AppError("Student not found", 404);
    }
    store.students[index] = {
      ...store.students[index],
      ...updates,
      updatedAt: new Date(),
    };
    return store.students[index];
  }

  async deleteStudent(studentId) {
    try {
      const student = await Student.findById(studentId);
      if (student) {
        student.isDeleted = true;
        student.deletedAt = new Date();
        await student.save();
        return student;
      }
    } catch (e) {}

    const s = store.students.find(
      (item) => item._id === studentId || item.studentId === studentId,
    );
    if (!s) {
      throw new AppError("Student not found", 404);
    }
    s.isDeleted = true;
    s.deletedAt = new Date();
    return s;
  }

  async permanentlyDeleteStudent(studentId) {
    try {
      await Student.findByIdAndDelete(studentId);
    } catch (e) {}
    const index = store.students.findIndex(
      (item) => item._id === studentId || item.studentId === studentId,
    );
    if (index !== -1) {
      store.students.splice(index, 1);
    }
    return { success: true };
  }

  async restoreStudent(studentId) {
    try {
      const student = await Student.findById(studentId);
      if (student) {
        student.isDeleted = false;
        student.deletedAt = undefined;
        await student.save();
        return student;
      }
    } catch (e) {}

    const s = store.students.find(
      (item) => item._id === studentId || item.studentId === studentId,
    );
    if (!s) {
      throw new AppError("Student not found", 404);
    }
    s.isDeleted = false;
    s.deletedAt = undefined;
    return s;
  }

  async uploadPhoto(studentId, photoPath) {
    const s = store.students.find(
      (item) => item._id === studentId || item.studentId === studentId,
    );
    if (s) {
      s.photo = photoPath;
      return s;
    }
    return { photo: photoPath };
  }

  async exportStudents(filters = {}, format = "json") {
    let list = store.students.filter((s) => !s.isDeleted);
    const exportData = list.map((student) => ({
      studentId: student.studentId,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      phone: student.phone,
      grade: student.grade,
      section: student.section,
      status: student.status,
      enrollmentDate: student.enrollmentDate,
    }));

    if (format === "csv") {
      const parser = new Parser();
      return parser.parse(exportData);
    } else {
      return JSON.stringify(exportData, null, 2);
    }
  }

  async importStudents(filePath, userId) {
    return { successful: [], failed: [], total: 0 };
  }

  async getStatistics() {
    const valid = store.students.filter((s) => !s.isDeleted);
    const total = valid.length;
    const active = valid.filter((s) => s.status === "active").length;
    const inactive = total - active;

    const gradeMap = {};
    const genderMap = {};
    for (const s of valid) {
      const g = s.grade || "Other";
      gradeMap[g] = (gradeMap[g] || 0) + 1;
      const gen = s.gender || "other";
      genderMap[gen] = (genderMap[gen] || 0) + 1;
    }

    const byGrade = Object.entries(gradeMap).map(([k, v]) => ({ _id: k, count: v }));
    const byGender = Object.entries(genderMap).map(([k, v]) => ({ _id: k, count: v }));

    return {
      total,
      active,
      inactive,
      byGrade,
      byGender,
      recentEnrollments: valid.length,
      lastUpdated: new Date(),
    };
  }

  async getStudentsByGrade(grade) {
    return store.students.filter(
      (s) => !s.isDeleted && s.grade?.toUpperCase() === grade.toUpperCase(),
    );
  }

  async searchStudents(searchTerm) {
    const q = (searchTerm || "").toLowerCase();
    return store.students.filter(
      (s) =>
        !s.isDeleted &&
        (s.firstName?.toLowerCase().includes(q) ||
          s.lastName?.toLowerCase().includes(q) ||
          s.studentId?.toLowerCase().includes(q)),
    );
  }

  async promoteStudents({ grade, newGrade, academicYear, status = "active" }) {
    let count = 0;
    for (const s of store.students) {
      if (!s.isDeleted && s.grade?.toUpperCase() === grade.toUpperCase()) {
        s.grade = newGrade.toUpperCase();
        s.academicYear = academicYear;
        s.status = status;
        count++;
      }
    }
    return { matchedCount: count, modifiedCount: count };
  }

  async failStudents({ grade, academicYear, status = "failed" }) {
    let count = 0;
    for (const s of store.students) {
      if (!s.isDeleted && s.grade?.toUpperCase() === grade.toUpperCase()) {
        s.status = status;
        s.academicYear = academicYear;
        count++;
      }
    }
    return { matchedCount: count, modifiedCount: count };
  }
}

module.exports = new StudentService();
