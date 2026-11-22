import java.sql.SQLException;
import java.util.List;
import java.util.Scanner;

/**
 * Console-based Course Management System driver class.
 * Provides a menu-driven CLI backed by CourseDAO and MySQL.
 */
public class CourseManagementSystem {

    private static final String TABLE_BORDER =
        "+-----------+------------------------------+----------------+-------------+------------------------+";
    private static final String TABLE_HEADER =
        "| Course ID | Course Name                  | Duration       | Fees        | Trainer Name           |";

    public static void main(String[] args) {
        CourseDAO dao = new CourseDAO();

        System.out.println("=========================================================================");
        System.out.println("                 COLLEGE COURSE MANAGEMENT SYSTEM (JDBC)                 ");
        System.out.println("=========================================================================");

        if (dao.isEmbeddedMode()) {
            System.out.println("[DATABASE] Running in Embedded MySQL-Compatible Database Mode (H2).");
            System.out.println("           Zero setup required! Data is stored locally in college_db.mv.db");
            System.out.println("           (To connect to a live MySQL server, simply start MySQL on port 3306)");
        } else {
            System.out.println("[DATABASE] Connected successfully to MySQL Database.");
        }

        // Using try-with-resources ensures Scanner (and underlying System.in stream) closes cleanly on exit.
        try (Scanner scanner = new Scanner(System.in)) {
            boolean running = true;

            while (running) {
                printMenu();
                int choice = readInt(scanner, "Select an option (1-6): ");

                switch (choice) {
                    case 1:
                        handleCreate(scanner, dao);
                        break;
                    case 2:
                        handleDisplayAll(dao);
                        break;
                    case 3:
                        handleSearchById(scanner, dao);
                        break;
                    case 4:
                        handleUpdate(scanner, dao);
                        break;
                    case 5:
                        handleDelete(scanner, dao);
                        break;
                    case 6:
                        System.out.println("\nClosing resources and exiting Course Management System. Goodbye!");
                        running = false;
                        break;
                    default:
                        System.out.println("\n[Invalid Option] Please enter a number between 1 and 6.");
                }
            }
        }
    }

    private static void printMenu() {
        System.out.println("\n----------------------------- MAIN MENU -----------------------------");
        System.out.println("  1. Add New Course (Create)");
        System.out.println("  2. Display All Courses (Read)");
        System.out.println("  3. Search Course by ID");
        System.out.println("  4. Update Course Details");
        System.out.println("  5. Delete Course");
        System.out.println("  6. Exit");
        System.out.println("---------------------------------------------------------------------");
    }

    // -------------------------------------------------------------------------
    // Menu Action 1: Create (Insert)
    // -------------------------------------------------------------------------
    private static void handleCreate(Scanner scanner, CourseDAO dao) {
        System.out.println("\n--- Add New Course ---");
        int courseId = readPositiveInt(scanner, "Enter Course ID (positive integer): ");
        String courseName = readRequiredString(scanner, "Enter Course Name (max 100 chars): ", 100);
        String duration = readRequiredString(scanner, "Enter Duration (e.g., '8 Weeks', max 50 chars): ", 50);
        double fees = readNonNegativeDouble(scanner, "Enter Course Fees: ");
        String trainerName = readRequiredString(scanner, "Enter Trainer Name (max 100 chars): ", 100);

        Course newCourse = new Course(courseId, courseName, duration, fees, trainerName);

        try {
            boolean inserted = dao.insertCourse(newCourse);
            if (inserted) {
                System.out.println("\n[SUCCESS] Course added successfully:");
                printSingleCourseTable(newCourse);
            } else {
                System.out.println("\n[FAILED] Course could not be inserted.");
            }
        } catch (CourseDAO.DuplicateCourseException e) {
            System.out.println("\n[DUPLICATE KEY ERROR] " + e.getMessage());
            System.out.println("Please choose a unique Course ID and try again.");
        } catch (SQLException e) {
            System.err.println("\n[DATABASE ERROR] Failed to insert course: " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Menu Action 2: Read (Display All)
    // -------------------------------------------------------------------------
    private static void handleDisplayAll(CourseDAO dao) {
        System.out.println("\n--- All Registered Courses ---");
        try {
            List<Course> courses = dao.getAllCourses();
            if (courses.isEmpty()) {
                System.out.println("No courses found in college_db.courses. Use option 1 to add a course.");
                return;
            }
            System.out.println(TABLE_BORDER);
            System.out.println(TABLE_HEADER);
            System.out.println(TABLE_BORDER);
            for (Course course : courses) {
                System.out.println(course);
            }
            System.out.println(TABLE_BORDER);
            System.out.println("Total courses: " + courses.size());
        } catch (SQLException e) {
            System.err.println("\n[DATABASE ERROR] Failed to fetch courses: " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Menu Action 3: Search by ID
    // -------------------------------------------------------------------------
    private static void handleSearchById(Scanner scanner, CourseDAO dao) {
        System.out.println("\n--- Search Course by ID ---");
        int courseId = readPositiveInt(scanner, "Enter Course ID to search: ");

        try {
            Course course = dao.getCourseById(courseId);
            if (course == null) {
                System.out.println("\n[NOT FOUND] No course found with ID: " + courseId);
            } else {
                System.out.println("\n[FOUND] Course details:");
                printSingleCourseTable(course);
            }
        } catch (SQLException e) {
            System.err.println("\n[DATABASE ERROR] Failed to search course: " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Menu Action 4: Update
    // -------------------------------------------------------------------------
    private static void handleUpdate(Scanner scanner, CourseDAO dao) {
        System.out.println("\n--- Update Course ---");
        int courseId = readPositiveInt(scanner, "Enter Course ID to update: ");

        try {
            Course existing = dao.getCourseById(courseId);
            if (existing == null) {
                System.out.println("\n[NOT FOUND] Cannot update. No course exists with ID: " + courseId);
                return;
            }

            System.out.println("\nCurrent course details:");
            printSingleCourseTable(existing);
            System.out.println("Enter new details (press Enter to keep the current value):");

            String newName = readOptionalString(
                scanner,
                "Course Name [" + existing.getCourseName() + "]: ",
                existing.getCourseName(),
                100
            );
            String newDuration = readOptionalString(
                scanner,
                "Duration [" + existing.getDuration() + "]: ",
                existing.getDuration(),
                50
            );
            double newFees = readOptionalNonNegativeDouble(
                scanner,
                String.format("Fees [%.2f]: ", existing.getFees()),
                existing.getFees()
            );
            String newTrainer = readOptionalString(
                scanner,
                "Trainer Name [" + existing.getTrainerName() + "]: ",
                existing.getTrainerName(),
                100
            );

            Course updated = new Course(courseId, newName, newDuration, newFees, newTrainer);
            boolean success = dao.updateCourse(updated);
            if (success) {
                System.out.println("\n[SUCCESS] Course ID " + courseId + " updated:");
                printSingleCourseTable(updated);
            } else {
                System.out.println("\n[FAILED] Course ID " + courseId + " was not updated.");
            }
        } catch (SQLException e) {
            System.err.println("\n[DATABASE ERROR] Failed to update course: " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Menu Action 5: Delete
    // -------------------------------------------------------------------------
    private static void handleDelete(Scanner scanner, CourseDAO dao) {
        System.out.println("\n--- Delete Course ---");
        int courseId = readPositiveInt(scanner, "Enter Course ID to delete: ");

        try {
            boolean deleted = dao.deleteCourse(courseId);
            if (deleted) {
                System.out.println("\n[SUCCESS] Course with ID " + courseId + " has been deleted.");
            } else {
                System.out.println("\n[NOT FOUND] Deletion skipped. No course exists with ID: " + courseId);
            }
        } catch (SQLException e) {
            System.err.println("\n[DATABASE ERROR] Failed to delete course: " + e.getMessage());
        }
    }

    private static void printSingleCourseTable(Course course) {
        System.out.println(TABLE_BORDER);
        System.out.println(TABLE_HEADER);
        System.out.println(TABLE_BORDER);
        System.out.println(course);
        System.out.println(TABLE_BORDER);
    }

    // -------------------------------------------------------------------------
    // Validated Input Helpers
    // Reading every input via nextLine() avoids Scanner newline buffer issues.
    // -------------------------------------------------------------------------
    private static int readInt(Scanner scanner, String prompt) {
        while (true) {
            System.out.print(prompt);
            String raw = scanner.nextLine().trim();
            try {
                return Integer.parseInt(raw);
            } catch (NumberFormatException e) {
                System.out.println("[Input Error] '" + raw + "' is not a valid integer. Please try again.");
            }
        }
    }

    private static int readPositiveInt(Scanner scanner, String prompt) {
        while (true) {
            int value = readInt(scanner, prompt);
            if (value > 0) {
                return value;
            }
            System.out.println("[Input Error] Value must be a positive integer greater than 0.");
        }
    }

    private static double readNonNegativeDouble(Scanner scanner, String prompt) {
        while (true) {
            System.out.print(prompt);
            String raw = scanner.nextLine().trim();
            try {
                double value = Double.parseDouble(raw);
                if (Double.isFinite(value) && value >= 0.0) {
                    return value;
                }
                System.out.println("[Input Error] Fees cannot be negative or infinite.");
            } catch (NumberFormatException e) {
                System.out.println("[Input Error] '" + raw + "' is not a valid numeric fee. Please try again.");
            }
        }
    }

    private static double readOptionalNonNegativeDouble(Scanner scanner, String prompt, double currentValue) {
        while (true) {
            System.out.print(prompt);
            String raw = scanner.nextLine().trim();
            if (raw.isEmpty()) {
                return currentValue;
            }
            try {
                double value = Double.parseDouble(raw);
                if (Double.isFinite(value) && value >= 0.0) {
                    return value;
                }
                System.out.println("[Input Error] Fees cannot be negative or infinite.");
            } catch (NumberFormatException e) {
                System.out.println("[Input Error] '" + raw + "' is not a valid numeric fee. Please try again.");
            }
        }
    }

    private static String readRequiredString(Scanner scanner, String prompt, int maxLength) {
        while (true) {
            System.out.print(prompt);
            String raw = scanner.nextLine().trim();
            if (raw.isEmpty()) {
                System.out.println("[Input Error] This field cannot be empty.");
                continue;
            }
            if (raw.length() > maxLength) {
                System.out.println("[Input Error] Input exceeds maximum length of " + maxLength + " characters.");
                continue;
            }
            return raw;
        }
    }

    private static String readOptionalString(Scanner scanner, String prompt, String currentValue, int maxLength) {
        while (true) {
            System.out.print(prompt);
            String raw = scanner.nextLine().trim();
            if (raw.isEmpty()) {
                return currentValue;
            }
            if (raw.length() > maxLength) {
                System.out.println("[Input Error] Input exceeds maximum length of " + maxLength + " characters.");
                continue;
            }
            return raw;
        }
    }
}
