# Course Management System (Java + JDBC)

A console-based Course Management System built using **Java (JDK 17+)** and **JDBC** to perform complete **CRUD (Create, Read, Update, Delete) + Search** operations from the Command Prompt / PowerShell.

---

## 🚀 Option 1: Run Instantly (No MySQL Installation Needed!)

The system includes a self-contained embedded MySQL-compatible database engine (`h2`). If a local MySQL server is not running, the application automatically uses this embedded engine so you can test all CRUD operations with **zero configuration or server setup**.

In PowerShell / Terminal:
```powershell
cd "c:\Users\piyus\Downloads\Java assignemnt\commandPrompt"
javac -cp "lib/*" -d out src/*.java
java -cp "out;lib/*" CourseManagementSystem
```
*(On macOS / Linux, use `:` instead of `;`: `java -cp "out:lib/*" CourseManagementSystem`)*

---

## 🗄️ Option 2: Connect to a Real MySQL Server

When you are ready to run against an official MySQL server:

### A. Database Setup:
Import the provided schema into your MySQL server:
```bash
mysql -u root -p < schema.sql
```

### B. Configure Environment Variables (if your password is not 'root'):
```powershell
$env:COURSE_DB_USER="root"
$env:COURSE_DB_PASSWORD="your_mysql_password"
```

### C. Compile & Run:
```powershell
cd "c:\Users\piyus\Downloads\Java assignemnt\commandPrompt"
javac -cp "lib/*" -d out src/*.java
java -cp "out;lib/*" CourseManagementSystem
```

---

## 📋 Features & CRUD Operations:
1. **Create (Insert)**: Enter Course ID, Course Name, Duration, Fees, and Trainer Name.
2. **Read (Display All)**: Formats all database rows into a clear ASCII table.
3. **Search by ID**: Search any course record by its unique Course ID.
4. **Update**: Modify course name, duration, fees, and trainer name for an existing Course ID.
5. **Delete**: Remove a course record by Course ID.
6. **Input Validation**: Rejects duplicate IDs, negative fees, and invalid input strings.
