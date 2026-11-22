# Course Management System (Java + JDBC)

A console-based Course Management System built using **Java (JDK 17+)** and **JDBC** to perform complete **CRUD (Create, Read, Update, Delete) + Search** operations.

---

## 🚀 Option 1: Run Instantly (No MySQL Installation Needed!)

The system includes a self-contained embedded MySQL-compatible database engine (`h2`). If a local MySQL server is not running, the application automatically uses this embedded engine so you can test all CRUD operations with **zero configuration or server setup**.

In PowerShell / Terminal:
```powershell
cd "c:\Users\piyus\Downloads\Java assignemnt\java"
javac -cp "lib/*" -d out src/*.java
java -cp "out;lib/*" CourseManagementSystem
```
*(On macOS / Linux, use `:` instead of `;`: `java -cp "out:lib/*" CourseManagementSystem`)*

---

## 🗄️ Option 2: Connect to a Real MySQL Server

When you are ready to submit or run against an official MySQL server:

### A. Quick Ways to Get MySQL on Windows:
1. **Via XAMPP (Easiest)**:
   - Download & install [XAMPP](https://www.apachefriends.org/) or run `winget install ApacheFriends.Xampp.8.2`
   - Open XAMPP Control Panel and click **Start** next to MySQL.
2. **Via Docker** (if Docker Desktop is installed):
   ```powershell
   docker run -d --name mysql-college -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -e MYSQL_DATABASE=college_db mysql:8.0
   ```
3. **Via Winget**:
   ```powershell
   winget install Oracle.MySQL
   ```

### B. Database Setup:
Import the provided schema:
```bash
mysql -u root -p < schema.sql
```

### C. Configure Environment Variables (if your MySQL password is not blank):
```powershell
$env:COURSE_DB_USER="root"
$env:COURSE_DB_PASSWORD="your_mysql_password"
```

### D. Compile & Run:
```powershell
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
