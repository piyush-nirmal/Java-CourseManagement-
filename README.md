# Course Management System (Java + JDBC + MySQL)

A complete **Course Management System** built using **Java**, **JDBC**, and **MySQL** that implements full **CRUD (Create, Read, Update, Delete) + Search** operations. It also includes an interactive **React + Vite** companion web interface connected live to the MySQL database.

---

## 📌 Project Overview & Requirements

* **Language:** Java (JDK 17+)
* **Database:** MySQL 8.x (`college_db`)
* **Connectivity:** JDBC with `PreparedStatement` (SQL injection proof)
* **Design Pattern:** Data Access Object (DAO) Architecture
* **Web UI:** React 19, Tailwind CSS, Vite with Live MySQL Bridge

---

## 🛠️ CRUD Operations

| Operation | Action | Description |
|---|---|---|
| **Create (Insert)** | Add New Course | Inserts Course ID, Course Name, Duration, Fees, and Trainer Name into MySQL. Protects against duplicate Course IDs. |
| **Read (Display)** | Display All Courses | Fetches and renders all courses in an aligned ASCII table. |
| **Search** | Search Course by ID | Finds and retrieves course details using the primary key `course_id`. |
| **Update** | Modify Course Details | Allows editing Course Name, Duration, Fees, and Trainer Name by Course ID. |
| **Delete** | Delete Course | Removes a course record identified by Course ID. |

---

## 📂 Project Structure

```
.
├── java/
│   ├── lib/
│   │   ├── mysql-connector-j-9.1.0.jar   # Official MySQL JDBC Driver
│   │   └── h2-2.3.232.jar                # Offline fallback driver
│   ├── src/
│   │   ├── Course.java                   # POJO Model class with encapsulation
│   │   ├── CourseDAO.java                # JDBC Data Access Object (CRUD queries)
│   │   └── CourseManagementSystem.java   # Menu-driven CLI Application
│   ├── schema.sql                        # MySQL DDL & sample data
│   └── README.md                         # Java CLI documentation
├── src/                                  # React Web Application source
├── vite.config.ts                        # Vite configuration & MySQL API bridge
├── package.json                          # Web dependencies
└── README.md                             # Repository documentation
```

---

## 🚀 How to Run the Java Console Application (PowerShell / Terminal)

### 1. Database Setup (MySQL)
Make sure MySQL is running on `localhost:3306`, then import the schema:
```powershell
Get-Content java/schema.sql | mysql -u root -p
```

### 2. Run the Java Application
```powershell
cd java
javac -cp "lib/*" -d out src/*.java
java -cp "out;lib/*" CourseManagementSystem
```

---

## 🌐 How to Run the Web Application

To launch the visual web dashboard (`http://localhost:3000`):

```powershell
npm install --legacy-peer-deps
npm run dev
```

Open your browser at **http://localhost:3000**. The web dashboard connects live to the same MySQL database!
