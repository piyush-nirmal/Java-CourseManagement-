-- ============================================================================
-- MySQL Setup Script: Course Management System
-- Database: college_db
-- Table:    courses
-- ============================================================================

CREATE DATABASE IF NOT EXISTS college_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE college_db;

CREATE TABLE IF NOT EXISTS courses (
    course_id    INT          NOT NULL,
    course_name  VARCHAR(100) NOT NULL,
    duration     VARCHAR(50)  NOT NULL,
    fees         DOUBLE       NOT NULL,
    trainer_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (course_id)
) ENGINE=InnoDB;

