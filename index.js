const inquirer = require('inquirer');
const connection = require('./config/connection');

const roleChoices = [];
// Main Menu
const mainMenu = async () => {
	const answer = await inquirer.prompt([
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
	]);

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
			await mainMenu();
	}
};

// View all Departments
const viewAllDepartments = async () => {
	const query = `SELECT id AS 'ID', department_name AS 'Department' FROM department`;
	try {
		const [rows] = await connection.promise().query(query);
		console.table(rows);
		await mainMenu();
	} catch (err) {
		throw err;
	}
};

// View all roles
const viewAllRoles = async () => {
	const query = `SELECT department_id AS 'ID', role.title AS 'Job Title', department.department_name AS 'Department',
					CONCAT('$', FORMAT(role.salary, 0)) AS 'Salary'
					FROM role
					INNER JOIN department ON role.department_id = department.id`;
	try {
		const [rows] = await connection.promise().query(query);
		console.log('\nJob Titles:');
		console.table(rows);
		await mainMenu();
	} catch (err) {
		throw err;
	}
};

// View all employees
const viewAllEmployees = async () => {
	const query = `SELECT employee.id AS 'ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name',
					role.title AS 'Title', department.department_name AS 'Department',
					CONCAT('$', FORMAT(role.salary, 0)) AS 'Salary',
					CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager'
					FROM employee
					INNER JOIN role ON employee.role_id = role.id
					INNER JOIN department ON role.department_id = department.id
					LEFT JOIN employee manager ON employee.manager_id = manager.id`;
	try {
		const [rows] = await connection.promise().query(query);
		console.table(rows);
		await mainMenu();
	} catch (err) {
		throw err;
	}
};

// View Employees by department
async function viewEmployeesByDepartment() {
	try {
		const [departments] = await connection
			.promise()
			.query('SELECT * FROM department');
		const departmentChoices = departments.map(({ id, department_name }) => ({
			name: department_name,
			value: id,
		}));
		const { department_id } = await inquirer.prompt({
			type: 'list',
			name: 'department_id',
			message: 'Select a department:',
			choices: departmentChoices,
		});
		const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                WHERE department.id = ?`;
		const [rows] = await connection.promise().query(query, [department_id]);
		console.table(rows);
		mainMenu();
	} catch (err) {
		throw err;
	}
}

// Add Department
async function addDepartment() {
	try {
		const answer = await inquirer.prompt({
			name: 'departmentName',
			type: 'input',
			message: 'What is the name of the department you want to add?',
		});

		await connection.promise().query('INSERT INTO department SET ?', {
			department_name: answer.departmentName,
		});

		console.log('Department added successfully!');
		mainMenu();
	} catch (err) {
		throw err;
	}
}

// Add Role
async function addRole() {
	const roleChoices = [];
	try {
		const [departments] = await connection
			.promise()
			.query('SELECT * FROM department');
		for (var i = 0; i < departments.length; i++) {
			roleChoices.push(departments[i].department_name);
		}
		const answer = await inquirer.prompt([
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
		const [department] = await connection
			.promise()
			.query('SELECT id FROM department WHERE department_name = ?', [
				answer.department,
			]);
		await connection.promise().query('INSERT INTO role SET ?', {
			title: answer.title,
			salary: answer.salary,
			department_id: department[0].id,
		});
		console.log('Role added successfully!');
		mainMenu();
	} catch (err) {
		throw err;
	}
}

// Add Employee
const addEmployee = async () => {
	try {
		const [rows] = await connection.promise().query('SELECT title FROM role');
		const roleChoices = rows.map((role) => role.title);

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
	} catch (err) {
		throw err;
	}
};

// Update Role
async function updateEmployeeRole() {
	const roleChoices = [];

	const [employeeRows] = await connection
		.promise()
		.query('SELECT * FROM employee');

	const employeeChoices = employeeRows.map((row) => ({
		name: `${row.first_name} ${row.last_name}`,
		value: row.id,
	}));

	const { employeeId } = await inquirer.prompt({
		name: 'employeeId',
		type: 'list',
		choices: employeeChoices,
		message: "Select the employee you'd like to update:",
	});

	const [roleRows] = await connection.promise().query('SELECT * FROM role');

	for (var i = 0; i < roleRows.length; i++) {
		roleChoices.push(roleRows[i].title);
	}

	const { role } = await inquirer.prompt({
		name: 'role',
		type: 'list',
		choices: roleChoices,
		message: "Select the employee's new role:",
	});

	const [rows] = await connection
		.promise()
		.query('SELECT id FROM role WHERE title = ?', [role]);

	await connection
		.promise()
		.query('UPDATE employee SET role_id = ? WHERE id = ?', [
			rows[0].id,
			employeeId,
		]);

	console.log('Employee role updated successfully!');
	mainMenu();
}

mainMenu();
