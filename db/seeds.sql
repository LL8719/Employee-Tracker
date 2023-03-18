
INSERT INTO department (department_name)
VALUES ("Field"),
       ("Sales"),
       ("Operations"),
       ("Customer Service");

INSERT INTO role (title, salary, department_id)
VALUES ("Field Manager", 70000, 1),
       ("Sales Manager", 100000, 2),
       ("Operations Manager", 50000, 3),
       ("Customer Service Manager", 45000, 4),
       ("Field Rep", 60000, 1),
       ("Sales Rep", 900000, 2),
       ("Operations Rep", 40000, 3),
       ("Customer Service Rep", 35000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jack", "Daniels", 1, 4),
       ("Don", "Julio", 2, 3),
       ("Captain", "Morgan", 3, 2),
       ("Johnny", "Walker", 1, 2),
       ("Jose", "Cuervo", 5, 4),
       ("Rosa", "Chavez", 6, 3),
       ("Luis", "Lopez", 7, 2),
       ("Juan", "Smith", 8, 1);