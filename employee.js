const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
const credentials = require('dotenv').config();

//Connection to MySQL database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});



//Showing successful connection
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id: " + connection.threadId)
    runSearch();
});


function runSearch() {
    inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "View All Employees by Department",
            "View All Employees by Manager",
            "Add Employee",
            "Remove Employee",
            "Update Employee Role",
            "Update Employee Manager",
            "Add Role",
            "Remove Role"
        ]
    }).then(function (answer) {
        switch (answer.action) {
            case "View All Employees": //DONE
                employeeSearch();
                break;
            case "View All Employees by Department": //DONE
                employeeDeptSearch();
                break;
            case "View All Employees by Manager": //DONE
                employeeMgrSearch();
                break;
            case "Add Employee": //DONE
                addEmployee();
                break;
            case "Remove Employee":
                removeEmployee(); //DONE
                break;
            case "Update Employee Role":
                updateRole();
                break;
            case "Update Employee Manager":
                updateMgr();
                break;
            case "Add Role":
                addRole();
                break;
            case "Remove Role":
                removeRole();
                break;
            case "Exit":
                return connection.end();
            default:
                console.log("Hang")
                connection.end()
                break;
        }
    })
}


// View all employees
function employeeSearch() {
    var queryOne = "SELECT employee.id, first_name, last_name, role.title, department.name, employee.manager_id ";
    queryOne += "FROM employee join (role join department ON department.id = role.department_id)";
    queryOne += "ON employee.role_id = role.id ORDER BY employee.id";
    connection.query(queryOne, function (err, res) {
        if (err) throw err;
        console.table(res)
        runSearch();
    })
}



function employeeDeptSearch() {
    inquirer.prompt([
        {
            name: "department",
            type: "list",
            message: "Select a department:",
            choices: [
                "Engineering",
                "Finance",
                "Legal",
                "Sales",
                "Marketing",
                "Human Resources",
                "IT"
            ]
        }
    ]).then(function (answer) {
        var queryTwo = `SELECT employee.id, first_name, last_name, role_id, department.name, role.title, role.salary `;
        queryTwo += `From employee join (role join department ON department.id = role.department_id) `;
        queryTwo += `ON employee.role_id = role.id Where department.name = ?`
        console.log(answer.department)
        connection.query(queryTwo, [answer.department], function (err, res) {
            if (err) throw err;
            console.table(["ID", 'FirstName', 'LastName', 'Department'], res)
            runSearch();
        })
    })
}

function employeeMgrSearch() {
    connection.query("SELECT * FROM employee WHERE manager_id is null", function (err, managers) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "manager",
                type: "list",
                message: "Select a manager: ",
                choices: managers.map(man => ({ name: man.first_name + ' ' + man.last_name, value: man.id }))
            }
        ]).then(function (answer) {
            connection.query("SELECT first_name, last_name, role_id from employee WHERE manager_id = ?", [answer.manager], function (err, res) {
                if (err) throw err;
                console.table(res)
                runSearch();
            })



        })
    });
}
//first name last name role and manager
function addEmployee() {
    connection.query("SELECT * FROM role", function (err, roles) {
        if (err) throw err;
        connection.query("SELECT * FROM employee WHERE manager_id is null", function (err, managers) {
            if (err) throw err;

            inquirer.prompt([
                {
                    name: "firstname",
                    type: "input",
                    message: "Enter employee's first name"
                },
                {
                    name: "lastname",
                    type: "input",
                    message: "Enter employee's last name"
                },
                {
                    name: "position",
                    type: "list",
                    message: "Select employee's title:",
                    choices: roles.map(role => ({ name: role.title, value: role.id}))
                },
                {
                    name: "manager",
                    type: "list",
                    message: "Select employee's manager by name:",
                    choices: managers.map(man => ({ name: man.first_name + " " + man.last_name, value: man.id }))
                }
            ]).then(function (answer) {

                var queryFive = `INSERT INTO employee (first_name, last_name, role_id, manager_id)`;
                queryFive += `VALUES (?,?,?,?)`;

                connection.query(queryFive, [answer.firstname, answer.lastname, answer.position, answer.manager], function (err, res) {
                    if (err) throw err;
                    runSearch();
                })
            })
        })
    })
}


function removeEmployee() {
    connection.query("SELECT first_name, last_name, id FROM employee", function (err, employee) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "name",
                type: "list",
                message: "Which employee would you like to remove?",
                choices: employee.map(emp => ({ name: emp.first_name + ' ' + emp.last_name, value: emp.id }))
            }
        ]).then(function (answer) {
            connection.query("DELETE FROM employee WHERE id = ?", [answer.name], function (err, res) {
                if (err) throw err;
                runSearch();
            })
        })
    })

}

function updateRole() {
    connection.query("Select * from employee", function(err, employee){
        if(err) throw err;

        connection.query("Select * from role", function(err, roles) {
            if(err) throw err;

            inquirer.prompt([
                {
                    name: "employee",
                    type: "list",
                    message: "Select Employee whose role you'd like to update: ",
                    choices: employee.map(emp => ({ name: emp.first_name + " " + emp.last_name, value: emp.id}))
                },
                {
                    name:"role",
                    type: "list",
                    message: "Select a updated role for this employee: ",
                    choices: roles.map(role => ({ name: role.title, value: role.id}))
                }
            ]).then(function(answer){
                connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [answer.role, answer.employee], function (err, res) {
                    if (err) throw err
                    runSearch();
                })

            })

    })
    })

}

function updateMgr() {
    connection.query("SELECT * FROM employee", function(err, employee){
        if (err) throw err;
        connection.query("SELECT * FROM employee WHERE manager_id is null", function(err, manager){
            if (err) throw err;

            inquirer.prompt([
                {
                    name:"employee",
                    type:"list",
                    message:"Which employee would you like to update?",
                    choices: employee.map(emp => ({ name: emp.first_name + " " + emp.last_name, value: emp.id }))
                },
                {
                    name: "manager",
                    type: "list",
                    message: "Select Employee's new manager: ",
                    choices: manager.map(man => ({ name: man.first_name + " " + man.last_name, value: man.id }))
                }
            ]).then(function(answer){
                connection.query("UPDATE employee SET manager_id = ? WHERE id = ?", [answer.manager, answer.employee], function(err, res){
                    if (err) throw err;
                    runSearch();
                })
            })


        })
    })

}

function addRole() {
    connection.query("SELECT * FROM department", function (err, department) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "role",
                type: "input",
                message: "What role would you like to add?"
            },
            {
                name: "salary",
                type: "input",
                message: "What is this roles' salary?"
            },
            {
                name: "dept",
                type: "list",
                message: "choose a department: ",
                choices: department.map(dep => ({ name: dep.name, value: dep.id }))
            }
        ]).then(function (answer) {
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?,?,?)", [answer.role, answer.salary, answer.department], function (err, res) {
                if (err) throw err;
                runSearch();

            })

        })

    })

}

function removeRole() {
    connection.query("SELECT * FROM role", function (err, roles) {
        if (err) throw err; 

        inquirer.prompt([
            {
                name: "role",
                type: "list",
                message: "What role would you like to remove?",
                choices: roles.map(rol => ({ name: rol.title, value: rol.id }))
            }
        ]).then(function (answer) {
            connection.query("DELETE FROM role where id = ? ", [answer.role], function (err, res) {
                console.log("Success");
                runSearch();
            })
        })

    })
};
