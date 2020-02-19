DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30),
    PRIMARY KEY (id)
);

CREATE TABLE role (
	id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL (8,2),
    department_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id) references department(id)
);

CREATE TABLE employee (
	id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES ("1", "John", "Doe", "1", "1");



SELECT * 
FROM employee
INNER JOIN role ON employee.role_id = role.id;

SELECT * 
FROM role
INNER JOIN department ON role.department_id = department.id;