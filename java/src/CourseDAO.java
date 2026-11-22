import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) responsible for all JDBC interactions.
 * Connects to MySQL (localhost:3306/college_db) by default.
 * If MySQL server is not installed or running, it automatically activates
 * a self-contained embedded MySQL-compatible database (H2) so students can
 * run and test full CRUD operations with zero external installations.
 */
public class CourseDAO {

    public static final String MYSQL_URL =
        "jdbc:mysql://localhost:3306/college_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DEFAULT_MYSQL_USER = "root";
    private static final String DEFAULT_MYSQL_PASSWORD = "root";

    public static final String EMBEDDED_URL =
        "jdbc:h2:./college_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;AUTO_SERVER=TRUE";

    private String jdbcUrl;
    private String username;
    private String password;
    private boolean embeddedMode = false;

    /**
     * Custom checked exception thrown when inserting a duplicate primary key.
     */
    public static class DuplicateCourseException extends Exception {
        public DuplicateCourseException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    static {
        // Load MySQL Driver
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException ignored) {
        }
        // Load H2 Embedded Driver (for offline / zero-install testing)
        try {
            Class.forName("org.h2.Driver");
        } catch (ClassNotFoundException ignored) {
        }
    }

    public CourseDAO() {
        String envUrl = System.getenv("COURSE_DB_URL");
        if (envUrl != null && !envUrl.isBlank()) {
            this.jdbcUrl = envUrl.trim();
            this.username = resolveConfig("COURSE_DB_USER", DEFAULT_MYSQL_USER);
            this.password = resolveConfig("COURSE_DB_PASSWORD", DEFAULT_MYSQL_PASSWORD);
            this.embeddedMode = false;
        } else if (canConnect(MYSQL_URL, DEFAULT_MYSQL_USER, DEFAULT_MYSQL_PASSWORD)) {
            this.jdbcUrl = MYSQL_URL;
            this.username = DEFAULT_MYSQL_USER;
            this.password = DEFAULT_MYSQL_PASSWORD;
            this.embeddedMode = false;
        } else {
            // MySQL is not reachable: activate embedded MySQL-compatible mode
            this.jdbcUrl = EMBEDDED_URL;
            this.username = "sa";
            this.password = "";
            this.embeddedMode = true;
            initEmbeddedSchema();
        }
    }

    public CourseDAO(String jdbcUrl, String username, String password) {
        this.jdbcUrl = jdbcUrl;
        this.username = username;
        this.password = password;
        this.embeddedMode = jdbcUrl != null && jdbcUrl.startsWith("jdbc:h2:");
        if (this.embeddedMode) {
            initEmbeddedSchema();
        }
    }

    private static boolean canConnect(String url, String user, String pass) {
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            return conn != null && !conn.isClosed();
        } catch (Throwable t) {
            return false;
        }
    }

    private void initEmbeddedSchema() {
        String ddl = "CREATE TABLE IF NOT EXISTS courses ("
                   + "  course_id INT NOT NULL,"
                   + "  course_name VARCHAR(100) NOT NULL,"
                   + "  duration VARCHAR(50) NOT NULL,"
                   + "  fees DOUBLE NOT NULL,"
                   + "  trainer_name VARCHAR(100) NOT NULL,"
                   + "  PRIMARY KEY (course_id)"
                   + ")";

        try (Connection conn = DriverManager.getConnection(jdbcUrl, username, password);
             Statement stmt = conn.createStatement()) {
            stmt.execute(ddl);

            // Seed initial records if table is brand new
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM courses")) {
                if (rs.next() && rs.getInt(1) == 0) {
                    stmt.execute("INSERT INTO courses VALUES (101, 'Core Java & JDBC', '8 Weeks', 12500.0, 'Dr. Arvind Sharma')");
                    stmt.execute("INSERT INTO courses VALUES (102, 'Spring Boot Microservices', '12 Weeks', 18000.0, 'Meera Krishnan')");
                    stmt.execute("INSERT INTO courses VALUES (103, 'MySQL Database Design', '6 Weeks', 9500.0, 'Rohan Deshmukh')");
                }
            }
        } catch (SQLException ignored) {
        }
    }

    public boolean isEmbeddedMode() {
        return embeddedMode;
    }

    public String getJdbcUrl() {
        return jdbcUrl;
    }

    private static String resolveConfig(String envKey, String fallback) {
        String envVal = System.getenv(envKey);
        return (envVal != null && !envVal.isBlank()) ? envVal.trim() : fallback;
    }

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(jdbcUrl, username, password);
    }

    /**
     * Verifies database connectivity.
     */
    public boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            return false;
        }
    }

    /**
     * 1. CREATE: Inserts a new course into the courses table.
     *
     * @throws DuplicateCourseException if course_id already exists
     */
    public boolean insertCourse(Course course) throws DuplicateCourseException, SQLException {
        String sql = "INSERT INTO courses (course_id, course_name, duration, fees, trainer_name) "
                   + "VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, course.getCourseId());
            pstmt.setString(2, course.getCourseName());
            pstmt.setString(3, course.getDuration());
            pstmt.setDouble(4, course.getFees());
            pstmt.setString(5, course.getTrainerName());

            return pstmt.executeUpdate() > 0;
        } catch (SQLIntegrityConstraintViolationException e) {
            throw new DuplicateCourseException(
                "A course with ID " + course.getCourseId() + " already exists.", e
            );
        } catch (SQLException e) {
            // MySQL error code 1062 = ER_DUP_ENTRY
            if (e.getErrorCode() == 1062) {
                throw new DuplicateCourseException(
                    "A course with ID " + course.getCourseId() + " already exists.", e
                );
            }
            throw e;
        }
    }

    /**
     * 2. READ ALL: Fetches all courses ordered by course_id ascending.
     */
    public List<Course> getAllCourses() throws SQLException {
        String sql = "SELECT course_id, course_name, duration, fees, trainer_name "
                   + "FROM courses ORDER BY course_id ASC";
        List<Course> courses = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                courses.add(mapRow(rs));
            }
        }
        return courses;
    }

    /**
     * 3. SEARCH BY ID: Retrieves a single course by primary key, or null if missing.
     */
    public Course getCourseById(int courseId) throws SQLException {
        String sql = "SELECT course_id, course_name, duration, fees, trainer_name "
                   + "FROM courses WHERE course_id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, courseId);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        }
        return null;
    }

    /**
     * 4. UPDATE: Updates an existing course record identified by course_id.
     */
    public boolean updateCourse(Course course) throws SQLException {
        String sql = "UPDATE courses "
                   + "SET course_name = ?, duration = ?, fees = ?, trainer_name = ? "
                   + "WHERE course_id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, course.getCourseName());
            pstmt.setString(2, course.getDuration());
            pstmt.setDouble(3, course.getFees());
            pstmt.setString(4, course.getTrainerName());
            pstmt.setInt(5, course.getCourseId());

            return pstmt.executeUpdate() > 0;
        }
    }

    /**
     * 5. DELETE: Deletes a course record by course_id.
     */
    public boolean deleteCourse(int courseId) throws SQLException {
        String sql = "DELETE FROM courses WHERE course_id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, courseId);
            return pstmt.executeUpdate() > 0;
        }
    }

    private static Course mapRow(ResultSet rs) throws SQLException {
        return new Course(
            rs.getInt("course_id"),
            rs.getString("course_name"),
            rs.getString("duration"),
            rs.getDouble("fees"),
            rs.getString("trainer_name")
        );
    }
}
