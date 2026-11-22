/**
 * Model class representing a single course record in the {@code courses} table.
 * Encapsulates course attributes and formats tabular console output.
 */
public class Course {

    private int courseId;
    private String courseName;
    private String duration;
    private double fees;
    private String trainerName;

    public Course(int courseId, String courseName, String duration, double fees, String trainerName) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.duration = duration;
        this.fees = fees;
        this.trainerName = trainerName;
    }

    public int getCourseId() {
        return courseId;
    }

    public void setCourseId(int courseId) {
        this.courseId = courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public double getFees() {
        return fees;
    }

    public void setFees(double fees) {
        this.fees = fees;
    }

    public String getTrainerName() {
        return trainerName;
    }

    public void setTrainerName(String trainerName) {
        this.trainerName = trainerName;
    }

    /**
     * Truncates values exceeding column width so ASCII table borders stay aligned.
     */
    private static String truncate(String value, int maxLength) {
        if (value == null) {
            return "";
        }
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength - 3) + "...";
    }

    @Override
    public String toString() {
        return String.format(
            "| %-9d | %-28s | %-14s | %11.2f | %-22s |",
            courseId,
            truncate(courseName, 28),
            truncate(duration, 14),
            fees,
            truncate(trainerName, 22)
        );
    }
}
