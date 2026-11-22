export interface CourseRecord {
  courseId: number;
  courseName: string;
  duration: string;
  fees: number;
  trainerName: string;
}

export const INITIAL_COURSES: CourseRecord[] = [
  {
    courseId: 101,
    courseName: 'Core Java & JDBC',
    duration: '8 Weeks',
    fees: 12500.0,
    trainerName: 'Dr. Arvind Sharma',
  },
  {
    courseId: 102,
    courseName: 'Spring Boot Microservices',
    duration: '12 Weeks',
    fees: 18000.0,
    trainerName: 'Meera Krishnan',
  },
  {
    courseId: 103,
    courseName: 'MySQL Database Design',
    duration: '6 Weeks',
    fees: 9500.0,
    trainerName: 'Rohan Deshmukh',
  },
];
