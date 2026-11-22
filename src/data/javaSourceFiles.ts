import schemaSql from '../../java/schema.sql?raw';
import courseJava from '../../java/src/Course.java?raw';
import courseDaoJava from '../../java/src/CourseDAO.java?raw';
import courseManagementSystemJava from '../../java/src/CourseManagementSystem.java?raw';
import readmeMd from '../../java/README.md?raw';

export interface SourceFileEntry {
  id: string;
  filename: string;
  path: string;
  language: 'sql' | 'java' | 'markdown';
  summary: string;
  content: string;
}

export const JAVA_PROJECT_FILES: SourceFileEntry[] = [
  {
    id: 'schema',
    filename: 'schema.sql',
    path: 'schema.sql',
    language: 'sql',
    summary: 'MySQL DDL for college_db.courses and optional sample seed records',
    content: schemaSql,
  },
  {
    id: 'course',
    filename: 'Course.java',
    path: 'src/Course.java',
    language: 'java',
    summary: 'Model class with private fields, constructor, getters/setters, and tabular toString()',
    content: courseJava,
  },
  {
    id: 'dao',
    filename: 'CourseDAO.java',
    path: 'src/CourseDAO.java',
    language: 'java',
    summary: 'JDBC Data Access Object using PreparedStatement, try-with-resources, and duplicate key handling',
    content: courseDaoJava,
  },
  {
    id: 'main',
    filename: 'CourseManagementSystem.java',
    path: 'src/CourseManagementSystem.java',
    language: 'java',
    summary: 'Menu-driven CLI driver with Scanner newline-safe input validation across all 6 options',
    content: courseManagementSystemJava,
  },
  {
    id: 'readme',
    filename: 'README.md',
    path: 'README.md',
    language: 'markdown',
    summary: 'Classpath, compilation, and MySQL execution instructions for macOS, Linux, and Windows',
    content: readmeMd,
  },
];
