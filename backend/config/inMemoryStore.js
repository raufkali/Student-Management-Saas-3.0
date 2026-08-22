const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Mock in-memory database store with seed data
class InMemoryStore {
  constructor() {
    this.users = [];
    this.students = [];
    this.feeStructures = [];
    this.feeRecords = [];
    this.documents = [];
    this.settings = new Map();
    this.counter = 10;
    this.initialized = false;
    this.init();
  }

  async init() {
    if (this.initialized) return;

    // Seed Admin and Staff users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("password123", salt);
    const staffPassword = await bcrypt.hash("password123", salt);

    const adminUser = {
      _id: "60d0fe4f5311236168a109ca",
      username: "admin",
      email: "admin@example.com",
      password: adminPassword,
      firstName: "Alex",
      lastName: "Morgan",
      role: "admin",
      phone: "+1 (555) 234-5678",
      isActive: true,
      isEmailVerified: true,
      refreshTokens: [],
      preferences: { theme: "light", language: "en", notifications: true },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };

    const staffUser = {
      _id: "60d0fe4f5311236168a109cb",
      username: "staff",
      email: "staff@example.com",
      password: staffPassword,
      firstName: "Sarah",
      lastName: "Connor",
      role: "staff",
      phone: "+1 (555) 987-6543",
      isActive: true,
      isEmailVerified: true,
      refreshTokens: [],
      preferences: { theme: "light", language: "en", notifications: true },
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    };

    this.users.push(adminUser, staffUser);

    // Seed Fee Structures
    this.feeStructures = [
      {
        _id: "60d0fe4f5311236168a109f1",
        name: "High School Standard Fee Package",
        grade: "Grade 10",
        academicYear: "2025-2026",
        totalAmount: 1800,
        feeItems: [
          { name: "Tuition Fee", amount: 1200, type: "tuition" },
          { name: "Science Lab Fee", amount: 300, type: "lab" },
          { name: "Library Access", amount: 150, type: "library" },
          { name: "Sports & Activities", amount: 150, type: "sports" },
        ],
        createdAt: new Date("2025-01-10"),
      },
      {
        _id: "60d0fe4f5311236168a109f2",
        name: "Senior Secondary Science Stream",
        grade: "Grade 12",
        academicYear: "2025-2026",
        totalAmount: 2200,
        feeItems: [
          { name: "Tuition Fee", amount: 1500, type: "tuition" },
          { name: "Advanced STEM Lab", amount: 400, type: "lab" },
          { name: "Board Exam Prep", amount: 300, type: "exam" },
        ],
        createdAt: new Date("2025-01-10"),
      },
    ];

    // Seed Students
    this.students = [
      {
        _id: "60d0fe4f5311236168a10901",
        studentId: "STU-2025-001",
        registrationNumber: "REG-2025-001",
        firstName: "Emma",
        lastName: "Watson",
        gender: "female",
        dateOfBirth: "2008-04-15T00:00:00.000Z",
        nationality: "American",
        email: "emma.watson@studentmail.org",
        phone: "+1 (555) 345-6789",
        grade: "Grade 10",
        section: "A",
        academicYear: "2025-2026",
        enrollmentDate: "2024-09-01T00:00:00.000Z",
        status: "active",
        fatherName: "Chris Watson",
        fatherPhone: "+1 (555) 345-6780",
        motherName: "Jacqueline Luesby",
        motherPhone: "+1 (555) 345-6781",
        address: {
          street: "742 Evergreen Terrace",
          city: "Springfield",
          state: "IL",
          postalCode: "62704",
          country: "United States",
        },
        bloodGroup: "O+",
        medicalConditions: "None",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date("2024-09-01"),
        updatedAt: new Date("2025-01-15"),
      },
      {
        _id: "60d0fe4f5311236168a10902",
        studentId: "STU-2025-002",
        registrationNumber: "REG-2025-002",
        firstName: "Lucas",
        lastName: "Miller",
        gender: "male",
        dateOfBirth: "2007-11-22T00:00:00.000Z",
        nationality: "Canadian",
        email: "lucas.miller@studentmail.org",
        phone: "+1 (555) 456-7890",
        grade: "Grade 11",
        section: "B",
        academicYear: "2025-2026",
        enrollmentDate: "2024-09-01T00:00:00.000Z",
        status: "active",
        fatherName: "David Miller",
        fatherPhone: "+1 (555) 456-7891",
        motherName: "Claire Miller",
        motherPhone: "+1 (555) 456-7892",
        address: {
          street: "124 Conch Street",
          city: "Bikini",
          state: "CA",
          postalCode: "90210",
          country: "United States",
        },
        bloodGroup: "A+",
        medicalConditions: "Asthma (inhaler with student)",
        profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date("2024-09-02"),
        updatedAt: new Date("2025-02-01"),
      },
      {
        _id: "60d0fe4f5311236168a10903",
        studentId: "STU-2025-003",
        registrationNumber: "REG-2025-003",
        firstName: "Sophia",
        lastName: "Rodriguez",
        gender: "female",
        dateOfBirth: "2008-08-10T00:00:00.000Z",
        nationality: "Mexican",
        email: "sophia.r@studentmail.org",
        phone: "+1 (555) 567-8901",
        grade: "Grade 10",
        section: "A",
        academicYear: "2025-2026",
        enrollmentDate: "2024-09-03T00:00:00.000Z",
        status: "active",
        fatherName: "Carlos Rodriguez",
        fatherPhone: "+1 (555) 567-8902",
        motherName: "Elena Rodriguez",
        motherPhone: "+1 (555) 567-8903",
        address: {
          street: "308 Negra Arroyo Lane",
          city: "Albuquerque",
          state: "NM",
          postalCode: "87104",
          country: "United States",
        },
        bloodGroup: "B+",
        medicalConditions: "None",
        profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date("2024-09-03"),
        updatedAt: new Date("2025-01-20"),
      },
      {
        _id: "60d0fe4f5311236168a10904",
        studentId: "STU-2025-004",
        registrationNumber: "REG-2025-004",
        firstName: "James",
        lastName: "Chen",
        gender: "male",
        dateOfBirth: "2006-03-30T00:00:00.000Z",
        nationality: "American",
        email: "james.chen@studentmail.org",
        phone: "+1 (555) 678-9012",
        grade: "Grade 12",
        section: "Science",
        academicYear: "2025-2026",
        enrollmentDate: "2023-09-01T00:00:00.000Z",
        status: "active",
        fatherName: "Wei Chen",
        fatherPhone: "+1 (555) 678-9013",
        motherName: "Mei Chen",
        motherPhone: "+1 (555) 678-9014",
        address: {
          street: "42 Wallaby Way",
          city: "Seattle",
          state: "WA",
          postalCode: "98101",
          country: "United States",
        },
        bloodGroup: "O-",
        medicalConditions: "Peanut allergy",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date("2023-09-01"),
        updatedAt: new Date("2025-02-10"),
      },
      {
        _id: "60d0fe4f5311236168a10905",
        studentId: "STU-2025-005",
        registrationNumber: "REG-2025-005",
        firstName: "Aaliyah",
        lastName: "Patel",
        gender: "female",
        dateOfBirth: "2009-06-18T00:00:00.000Z",
        nationality: "British",
        email: "aaliyah.patel@studentmail.org",
        phone: "+1 (555) 789-0123",
        grade: "Grade 9",
        section: "A",
        academicYear: "2025-2026",
        enrollmentDate: "2024-09-05T00:00:00.000Z",
        status: "active",
        fatherName: "Raj Patel",
        fatherPhone: "+1 (555) 789-0124",
        motherName: "Priya Patel",
        motherPhone: "+1 (555) 789-0125",
        address: {
          street: "10 Downing Road",
          city: "Boston",
          state: "MA",
          postalCode: "02108",
          country: "United States",
        },
        bloodGroup: "AB+",
        medicalConditions: "None",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date("2024-09-05"),
        updatedAt: new Date("2025-02-12"),
      },
      {
        _id: "60d0fe4f5311236168a10906",
        studentId: "STU-2025-006",
        registrationNumber: "REG-2025-006",
        firstName: "Ethan",
        lastName: "Taylor",
        gender: "male",
        dateOfBirth: "2008-01-25T00:00:00.000Z",
        nationality: "American",
        email: "ethan.t@studentmail.org",
        phone: "+1 (555) 890-1234",
        grade: "Grade 10",
        section: "B",
        academicYear: "2025-2026",
        enrollmentDate: "2024-09-01T00:00:00.000Z",
        status: "inactive",
        fatherName: "Mark Taylor",
        fatherPhone: "+1 (555) 890-1235",
        motherName: "Lisa Taylor",
        motherPhone: "+1 (555) 890-1236",
        address: {
          street: "555 Cedar Lane",
          city: "Austin",
          state: "TX",
          postalCode: "78701",
          country: "United States",
        },
        bloodGroup: "A-",
        medicalConditions: "None",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date("2024-09-01"),
        updatedAt: new Date("2025-01-10"),
      },
    ];

    // Seed Fee Records
    this.feeRecords = [
      {
        _id: "60d0fe4f5311236168a109e1",
        studentId: this.students[0],
        academicYear: "2025-2026",
        grade: "Grade 10",
        totalFee: 1800,
        paidAmount: 1800,
        balanceAmount: 0,
        status: "paid",
        feeItems: [
          { name: "Tuition Fee", amount: 1200, type: "tuition" },
          { name: "Science Lab Fee", amount: 300, type: "lab" },
          { name: "Library Access", amount: 150, type: "library" },
          { name: "Sports & Activities", amount: 150, type: "sports" },
        ],
        payments: [
          {
            _id: "60d0fe4f5311236168a109p1",
            amount: 1800,
            paymentMethod: "online",
            paymentType: "tuition",
            transactionId: "TXN-984210",
            receiptNumber: "REC-2025-001",
            paymentDate: new Date("2025-01-05"),
            note: "Full annual term payment",
          },
        ],
        dueDate: new Date("2025-03-31"),
        createdAt: new Date("2025-01-02"),
      },
      {
        _id: "60d0fe4f5311236168a109e2",
        studentId: this.students[1],
        academicYear: "2025-2026",
        grade: "Grade 11",
        totalFee: 2000,
        paidAmount: 1000,
        balanceAmount: 1000,
        status: "partial",
        feeItems: [
          { name: "Tuition Fee", amount: 1500, type: "tuition" },
          { name: "Lab & Library", amount: 500, type: "lab" },
        ],
        payments: [
          {
            _id: "60d0fe4f5311236168a109p2",
            amount: 1000,
            paymentMethod: "bank_transfer",
            paymentType: "tuition",
            transactionId: "TXN-984211",
            receiptNumber: "REC-2025-002",
            paymentDate: new Date("2025-01-15"),
            note: "1st Installment",
          },
        ],
        dueDate: new Date("2025-04-15"),
        createdAt: new Date("2025-01-02"),
      },
      {
        _id: "60d0fe4f5311236168a109e3",
        studentId: this.students[3],
        academicYear: "2025-2026",
        grade: "Grade 12",
        totalFee: 2200,
        paidAmount: 0,
        balanceAmount: 2200,
        status: "pending",
        feeItems: [
          { name: "Tuition Fee", amount: 1500, type: "tuition" },
          { name: "Advanced STEM Lab", amount: 400, type: "lab" },
          { name: "Board Exam Prep", amount: 300, type: "exam" },
        ],
        payments: [],
        dueDate: new Date("2025-03-15"),
        createdAt: new Date("2025-01-02"),
      },
    ];

    // Seed Documents
    this.documents = [
      {
        _id: "60d0fe4f5311236168a109d1",
        studentId: "60d0fe4f5311236168a10901",
        studentName: "Emma Watson",
        title: "Birth Certificate & National ID",
        documentType: "birth_certificate",
        fileName: "emma_watson_id.pdf",
        filePath: "/uploads/documents/sample_birth_cert.pdf",
        fileSize: 245000,
        mimeType: "application/pdf",
        uploadedBy: "Alex Morgan",
        createdAt: new Date("2024-09-02"),
      },
      {
        _id: "60d0fe4f5311236168a109d2",
        studentId: "60d0fe4f5311236168a10902",
        studentName: "Lucas Miller",
        title: "Previous School Transfer Certificate",
        documentType: "transfer_certificate",
        fileName: "lucas_tc.pdf",
        filePath: "/uploads/documents/sample_tc.pdf",
        fileSize: 180000,
        mimeType: "application/pdf",
        uploadedBy: "Sarah Connor",
        createdAt: new Date("2024-09-03"),
      },
      {
        _id: "60d0fe4f5311236168a109d3",
        studentId: "60d0fe4f5311236168a10904",
        studentName: "James Chen",
        title: "Immunization & Medical Records",
        documentType: "medical_record",
        fileName: "medical_records.pdf",
        filePath: "/uploads/documents/sample_medical.pdf",
        fileSize: 312000,
        mimeType: "application/pdf",
        uploadedBy: "Alex Morgan",
        createdAt: new Date("2023-09-05"),
      },
    ];

    // Seed Settings
    const defaultSettings = [
      { key: "school_name", value: "Oakridge Global Academy", category: "general", isPublic: true },
      { key: "school_address", value: "100 Academic Way, Metro City, CA", category: "general", isPublic: true },
      { key: "school_phone", value: "+1 (800) 555-0199", category: "general", isPublic: true },
      { key: "school_email", value: "admissions@oakridgeacademy.edu", category: "general", isPublic: true },
      { key: "academic_year_start", value: 2025, category: "academic", isPublic: true },
      { key: "academic_year_end", value: 2026, category: "academic", isPublic: true },
      { key: "app_name", value: "Student Management System", category: "general", isPublic: true },
      { key: "app_version", value: "1.0.0", category: "general", isPublic: true },
      { key: "max_students_per_class", value: 35, category: "academic", isPublic: true },
      { key: "enable_notifications", value: true, category: "notification", isPublic: true },
      { key: "registration_fee", value: 150, category: "financial", isPublic: false },
    ];

    for (const s of defaultSettings) {
      this.settings.set(s.key, s);
    }

    this.initialized = true;
  }
}

const store = new InMemoryStore();
module.exports = store;
