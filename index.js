const inquirer = require('inquirer');
const mysql = require('mysql2');

// Create connection to MySQL database
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'king',
	database: 'main_db',
});
const roleChoices = [];
// Main Menu
const mainMenu = () => {
	return inquirer
		.prompt([
			{
				type: 'list',
				name: 'menu',
				message: 'Select an option:',
				choices: [
					'View all departments',
					'View all roles',
					'View all employees',
					'View Employees by department',
					'Add a department',
					'Add a role',
					'Add an employee',
					'Update an employee role',
					'Exit',
				],
			},
		])
		.then((answer) => {
			switch (answer.menu) {
				case 'View all departments':
					viewAllDepartments();
					break;
				case 'View all roles':
					viewAllRoles();
					break;
				case 'View all employees':
					viewAllEmployees();
					break;
				case 'View Employees by department':
					viewEmployeesByDepartment();
					break;
				case 'Add a department':
					addDepartment();
					break;
				case 'Add a role':
					addRole();
					break;
				case 'Add an employee':
					addEmployee();
					break;
				case 'Update an employee role':
					updateEmployeeRole();
					break;
				case 'Exit':
					connection.end();
					console.log('Goodbye!');
					break;
				default:
					console.log('Invalid option');
					mainMenu();
			}
		});
};
// View all Departments
const viewAllDepartments = () => {
	const query = `SELECT id AS 'ID', department_name AS 'Department' FROM department`;

	return connection
		.promise()
		.query(query)
		.then(([rows]) => {
			console.table(rows);
			mainMenu();
		})
		.catch((err) => {
			throw err;
		});
};

// View all roles
const viewAllRoles = () => {
	const query = `SELECT department_id AS 'ID', role.title AS 'Job Title', department.department_name AS 'Department', 
					 CONCAT('$', FORMAT(role.salary, 0)) AS 'Salary' 
					 FROM role 
					 INNER JOIN department ON role.department_id = department.id`;

	return connection
		.promise()
		.query(query)
		.then(([rows]) => {
			console.log('\nJob Titles:');
			console.table(rows);
			mainMenu();
		})
		.catch((err) => {
			throw err;
		});
};

// View all employees
const viewAllEmployees = () => {
	const query = `SELECT employee.id AS 'ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name', 
					 role.title AS 'Title', department.department_name AS 'Department', 
					 CONCAT('$', FORMAT(role.salary, 0)) AS 'Salary', 
					 CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager'
					 FROM employee 
					 INNER JOIN role ON employee.role_id = role.id 
					 INNER JOIN department ON role.department_id = department.id 
					 LEFT JOIN employee manager ON employee.manager_id = manager.id`;

	return connection
		.promise()
		.query(query)
		.then(([rows]) => {
			console.table(rows);
			mainMenu();
		})
		.catch((err) => {
			throw err;
		});
};

// View Employees by department
function viewEmployeesByDepartment() {
	connection
		.promise()
		.query('SELECT * FROM department')
		.then(([departments]) => {
			const departmentChoices = departments.map(({ id, department_name }) => ({
				name: department_name,
				value: id,
			}));
			return inquirer.prompt({
				type: 'list',
				name: 'department_id',
				message: 'Select a department:',
				choices: departmentChoices,
			});
		})
		.then(({ department_id }) => {
			const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                WHERE department.id = ?`;
			return connection.promise().query(query, [department_id]);
		})
		.then(([rows]) => {
			console.table(rows);
			mainMenu();
		})
		.catch((err) => {
			throw err;
		});
}

// Add Department
function addDepartment() {
	return inquirer
		.prompt({
			name: 'departmentName',
			type: 'input',
			message: 'What is the name of the department you want to add?',
		})
		.then(function (answer) {
			return connection
				.promise()
				.query('INSERT INTO department SET ?', {
					department_name: answer.departmentName,
				})
				.then(() => {
					console.log('Department added successfully!');
					mainMenu();
				})
				.catch((err) => {
					throw err;
				});
		});
}

// Add Role
function addRole() {
	const roleChoices = [];
	connection
		.promise()
		.query('SELECT * FROM department')
		.then(([departments]) => {
			for (var i = 0; i < departments.length; i++) {
				roleChoices.push(departments[i].department_name);
			}
			return inquirer.prompt([
				{
					name: 'title',
					type: 'input',
					message: 'What is the name of the role you want to add?',
				},
				{
					name: 'salary',
					type: 'input',
					message: 'What is the salary for this role?',
				},
				{
					name: 'department',
					type: 'list',
					choices: roleChoices,
					message: 'Which department does this role belong to?',
				},
			]);
		})
		.then((answer) => {
			return connection
				.promise()
				.query('SELECT id FROM department WHERE department_name = ?', [
					answer.department,
				])
				.then(([department]) => {
					return connection
						.promise()
						.query('INSERT INTO role SET ?', {
							title: answer.title,
							salary: answer.salary,
							department_id: department[0].id,
						})
						.then(() => {
							console.log('Role added successfully!');
							mainMenu();
						})
						.catch((err) => {
							throw err;
						});
				});
		});
}

// Add Employee
const addEmployee = async () => {
	const res = await connection.promise().query('SELECT title FROM role');
	const roleChoices = res[0].map((role) => role.title);

	const answer = await inquirer.prompt([
		{
			type: 'input',
			message: "Enter employee's first name:",
			name: 'firstName',
		},
		{
			type: 'input',
			message: "Enter employee's last name:",
			name: 'lastName',
		},
		{
			type: 'list',
			message: "Select employee's role:",
			name: 'role',
			choices: roleChoices,
		},
		{
			type: 'input',
			message: "Enter employee's manager ID:",
			name: 'managerID',
		},
	]);

	const role_id = roleChoices.indexOf(answer.role) + 1;
	const manager_id = answer.managerID || null;

	await connection.promise().query('INSERT INTO employee SET ?', {
		first_name: answer.firstName,
		last_name: answer.lastName,
		role_id,
		manager_id,
	});

	console.log('Employee added successfully!');
	mainMenu();
};

// Update Role
function updateEmployeeRole() {
	const roleChoices = [];

	connection
		.promise()
		.query('SELECT * FROM employee')
		.then(([rows]) => {
			const employeeChoices = rows.map((row) => ({
				name: `${row.first_name} ${row.last_name}`,
				value: row.id,
			}));

			return inquirer.prompt({
				name: 'employeeId',
				type: 'list',
				choices: employeeChoices,
				message: "Select the employee you'd like to update:",
			});
		})
		.then((answer) => {
			const employeeId = answer.employeeId;

			connection
				.promise()
				.query('SELECT * FROM role')
				.then(([rows]) => {
					for (var i = 0; i < rows.length; i++) {
						roleChoices.push(rows[i].title);
					}
					return inquirer.prompt({
						name: 'role',
						type: 'list',
						choices: roleChoices,
						message: "Select the employee's new role:",
					});
				})
				.then((answer) => {
					return connection
						.promise()
						.query('SELECT id FROM role WHERE title = ?', [answer.role])
						.then(([rows]) => {
							return connection
								.promise()
								.query('UPDATE employee SET role_id = ? WHERE id = ?', [
									rows[0].id,
									employeeId,
								])
								.then(() => {
									console.log('Employee role updated successfully!');
									mainMenu();
								})
								.catch((err) => {
									throw err;
								});
						});
				});
		});
}

mainMenu();
