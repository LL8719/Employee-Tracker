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

mainMenu();
