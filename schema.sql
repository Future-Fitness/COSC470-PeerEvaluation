USE cosc471;

-- Create all tables without foreign keys
CREATE TABLE User (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hash_pass VARCHAR(128) NOT NULL,
    is_teacher BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE OTP (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
);

CREATE TABLE Course (
    id SERIAL PRIMARY KEY,
    teacherID INT NOT NULL,
    name VARCHAR(255)
);

CREATE TABLE Assignment (
    id SERIAL PRIMARY KEY,
    courseID INT,
    name VARCHAR(255),
    rubric VARCHAR(255)
);

CREATE TABLE CourseGroup (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    assignmentID INT NOT NULL
);

CREATE TABLE Submission (
    id SERIAL PRIMARY KEY,
    path VARCHAR(255),
    studentID INT,
    assignmentID INT
);

CREATE TABLE Group_Members (
    groupID INT,
    userID INT,
    assignmentID INT,
    PRIMARY KEY (userID, groupID)
);

CREATE TABLE User_Courses (
    courseID INT,
    userID INT,
    PRIMARY KEY (userID, courseID)
);

CREATE TABLE Review (
    id SERIAL PRIMARY KEY,
    assignmentID INT,
    reviewerID INT,
    revieweeID INT
);

CREATE TABLE Criterion (
    id SERIAL PRIMARY KEY,
    reviewID INT,
    criterionRowID INT,
    grade INT,
    comments VARCHAR(255)
);

CREATE TABLE Rubric (
    id SERIAL PRIMARY KEY,
    assignmentID INT,
    canComment BOOLEAN
);

CREATE TABLE Criteria_Description (
    id SERIAL PRIMARY KEY,
    rubricID INT,
    question VARCHAR(255),
    scoreMax INT,
    hasScore BOOLEAN DEFAULT TRUE
);

-- Simple credentials for testing
-- Password for all users: 1234
INSERT INTO User (id, name, email, is_teacher, hash_pass)
VALUES 
    -- 1 Teacher
    (1, 'teacher', 'canadaharsh2002@gmail.com', TRUE, 'd404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db'),
    -- 1 Student
    (2, 'student1', 'jaddpi1@gmail.com', FALSE, 'd404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db');

-- Insert dummy Courses
INSERT INTO Course (teacherID, name)
VALUES
    (1, 'Introduction to Computer Science');

-- Insert dummy CourseGroups
INSERT INTO CourseGroup (name, assignmentID)
VALUES
    ('Group A', 2);

-- Insert dummy Submissions
INSERT INTO Submission (path, studentID, assignmentID)
VALUES
    ('/submissions/student1/assignment1.pdf', 2, 2);

-- Insert dummy Group_Members
INSERT INTO Group_Members (groupID, userID, assignmentID)
VALUES
    (1, 2, 2);


-- Insert dummy User_Courses
INSERT INTO User_Courses (courseID, userID)
VALUES
    (1, 2);

-- Insert dummy Reviews
INSERT INTO Review (assignmentID, reviewerID, revieweeID)
VALUES
    (2, 2, 2); 

-- Insert dummy Criteria
INSERT INTO Criterion (reviewID, grade, comments)
VALUES
    (1, 85, 'Good job!');
 
-- Insert dummy Rubrics
INSERT INTO Rubric (assignmentID)
VALUES
    (2); 

-- Insert dummy Criteria_Description
INSERT INTO Criteria_Description (scoreMax, hasScore)
VALUES
    (100, TRUE); 
-- -- Add foreign key constraints
-- ALTER TABLE Assignment
--     ADD CONSTRAINT fk_assignment_course
--     FOREIGN KEY (courseID) REFERENCES Course(id);

-- ALTER TABLE CourseGroup
--     ADD CONSTRAINT fk_coursegroup_assignment
--     FOREIGN KEY (assignmentID) REFERENCES Assignment(id);

-- ALTER TABLE Submission
--     ADD CONSTRAINT fk_submission_student
--     FOREIGN KEY (studentID) REFERENCES User(id),
--     ADD CONSTRAINT fk_submission_assignment
--     FOREIGN KEY (assignmentID) REFERENCES Assignment(id);

-- ALTER TABLE Group_Members
--     ADD CONSTRAINT fk_groupmembers_user
--     FOREIGN KEY (userID) REFERENCES User(id),
--     ADD CONSTRAINT fk_groupmembers_group
--     FOREIGN KEY (groupID) REFERENCES CourseGroup(id);

-- ALTER TABLE User_Courses
--     ADD CONSTRAINT fk_usercourses_user
--     FOREIGN KEY (userID) REFERENCES User(id),
--     ADD CONSTRAINT fk_usercourses_course
--     FOREIGN KEY (courseID) REFERENCES Course(id);

-- ALTER TABLE Review
--     ADD CONSTRAINT fk_review_assignment
--     FOREIGN KEY (assignmentID) REFERENCES Assignment(id),
--     ADD CONSTRAINT fk_review_reviewer
--     FOREIGN KEY (reviewerID) REFERENCES User(id),
--     ADD CONSTRAINT fk_review_reviewee
--     FOREIGN KEY (revieweeID) REFERENCES User(id);

-- ALTER TABLE Criteria
--     ADD CONSTRAINT fk_criteria_review
--     FOREIGN KEY (reviewID) REFERENCES Review(id);

-- ALTER TABLE Rubric
--     ADD CONSTRAINT fk_rubric_assignment
--     FOREIGN KEY (assignmentID) REFERENCES Assignment(id);