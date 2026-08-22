import api from "./api";

/**
 * Student service – all API calls for student management.
 * All methods return a Promise that resolves to the server response.
 */
export const studentService = {
  // ── CRUD ───────────────────────────────────────────────

  /**
   * Get all students with pagination, filters, and sorting.
   * @param {Object} params - Query parameters (page, limit, search, grade, section, status, fromDate, toDate, sortBy, sortOrder)
   */
  getAll: async (params) => {
    const response = await api.get("/students", { params });
    return response.data;
  },

  /**
   * Get a student by MongoDB ObjectId.
   * @param {string} id - Student's MongoDB _id
   */
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  /**
   * Get a student by their manually‑provided registration number.
   * @param {string} registrationNumber - Unique registration number
   */
  getByRegistrationNumber: async (registrationNumber) => {
    const response = await api.get(
      `/students/registration/${registrationNumber}`,
    );
    return response.data;
  },

  /**
   * Create a new student.
   * @param {Object} data - Student data (must include registrationNumber, and all required fields)
   */
  create: async (data) => {
    const response = await api.post("/students", data);
    return response.data;
  },

  /**
   * Update an existing student.
   * @param {string} id - Student's MongoDB _id
   * @param {Object} data - Fields to update
   */
  update: async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  /**
   * Soft‑delete a student.
   * @param {string} id - Student's MongoDB _id
   */
  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  // ── FILE UPLOADS ────────────────────────────────────────

  /**
   * Upload a photo for a student.
   * @param {string} id - Student's MongoDB _id
   * @param {File} file - Image file
   */
  uploadPhoto: async (id, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    const response = await api.post(`/students/${id}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Bulk import students from a CSV/Excel file.
   * @param {File} file - The import file
   */
  import: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/students/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ── EXPORTS ─────────────────────────────────────────────

  /**
   * Export students in JSON, CSV, or PDF format.
   * @param {string} format - 'json', 'csv', or 'pdf' (default: 'json')
   * @returns {Blob} - The exported file blob
   */
  export: async (format = "json") => {
    const response = await api.get("/students/export", {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },

  // ── SEARCH & FILTERS ──────────────────────────────────

  /**
   * Search students by name, ID, registration number, email, phone, etc.
   * @param {string} query - Search term
   */
  search: async (query) => {
    const response = await api.get("/students/search", {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Get all students in a specific grade.
   * @param {string} grade - Grade (e.g., '10')
   */
  getByGrade: async (grade) => {
    const response = await api.get(`/students/grade/${grade}`);
    return response.data;
  },

  // ── STATISTICS ──────────────────────────────────────────

  /**
   * Get aggregated statistics (counts by grade, status, gender, etc.).
   */
  getStatistics: async () => {
    const response = await api.get("/students/statistics");
    return response.data;
  },

  // ── BULK ACTIONS ──────────────────────────────────────

  /**
   * Promote all students from one grade to another for a new academic year.
   * @param {Object} data - { grade, newGrade, academicYear, status? }
   */
  promoteStudents: async (data) => {
    const response = await api.post("/students/promote", data);
    return response.data;
  },

  /**
   * Mark all students of a given grade as failed for an academic year.
   * @param {Object} data - { grade, academicYear, status? }
   */
  failStudents: async (data) => {
    const response = await api.post("/students/fail", data);
    return response.data;
  },
};
