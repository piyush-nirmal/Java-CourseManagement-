# Course Management System (Java + JDBC + MySQL)

A clean, modular repository containing both the **Java Console / Command Prompt Application** and the **Interactive Web Application** for the Course Management System.

---

## 📁 Repository Structure

```
.
├── commandPrompt/                      # 1. Java Console / Terminal Application
│   ├── lib/                            # JDBC Drivers (MySQL Connector/J & H2)
│   ├── src/                            # Java source files
│   │   ├── Course.java                 # Model entity (POJO)
│   │   ├── CourseDAO.java              # JDBC Data Access Object (CRUD queries)
│   │   └── CourseManagementSystem.java # Console menu driver
│   ├── schema.sql                      # MySQL DDL & database setup script
│   └── README.md                       # Command Prompt execution guide
│
├── Web/                                # 2. Interactive Web Application
│   ├── src/                            # React + TypeScript frontend
│   ├── public/                         # Static assets
│   ├── package.json                    # Dependencies (React, Vite, mysql2)
│   ├── vite.config.ts                  # Vite config with live MySQL bridge
│   └── index.html                      # HTML entry point
│
└── README.md                           # Main repository documentation
```

---

## 💻 1. How to Run the "commandPrompt" Application

This is the primary assignment application written in **pure Java using JDBC**:

```powershell
cd "c:\Users\piyus\Downloads\Java assignemnt\commandPrompt"
javac -cp "lib/*" -d out src/*.java
java -cp "out;lib/*" CourseManagementSystem
```

### Features:
1. **Create (Insert)**: Add new course (Course ID, Name, Duration, Fees, Trainer).
2. **Read (Display)**: Formats and displays all courses from MySQL in an aligned ASCII table.
3. **Search**: Search course details by Course ID.
4. **Update**: Modify existing course information.
5. **Delete**: Delete a course record by Course ID.

---

## 🌐 2. How to Run the "Web" Application

This is the interactive visual companion dashboard connected directly to the same MySQL database:

```powershell
cd "c:\Users\piyus\Downloads\Java assignemnt\Web"
npm install --legacy-peer-deps
npm run dev
```

Open your browser at: **http://localhost:3000**

---

## 🗄️ MySQL Database Setup

Make sure your MySQL server is running on `localhost:3306`, then import the database schema:

```powershell
Get-Content commandPrompt/schema.sql | mysql -u root -p
```
*(Database name: `college_db`, Table: `courses`)*
