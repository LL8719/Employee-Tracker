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

mainMenu();
