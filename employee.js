const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
const credentials = require('dotenv').config();

console.log(credentials.password)
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



// const employee = []
// const finalEmployee = []
// connection.query("SELECT * FROM employee", function (err, res) {
//     for (var i = 0; i < res.length; i++) {
//         const fName = res[i].first_name
//         const lName = res[i].last_name
//         const id = res[i].id
//         const newEmp = { id: id, first_name: fName, last_name: lName }
//         employee.push(newEmp)
//     }
//     console.log(employee)
    // for (var i = 0; i < employee.length; i++){
    //     const loop = employee[i].id + ", " + employee[i].last_name
    //     finalEmployee.push(loop)
    //     console.log(finalEmployee)
    // }
// })

const managerNames = []
connection.query("SELECT * FROM employee WHERE manager_id is null", function (err, res) {
    for (var i = 0; i < res.length; i++) {
        const last = res[i].last_name
        managerNames.push(last)
    }

})
const firstName = []
connection.query("SELECT first_name FROM employee", function (err, res) {
    for (var i = 0; i < res.length; i++) {
        const first = res[i].first_name
        firstName.push(first)
    }
})





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
            case "View All Employees":
                employeeSearch();
                break;
            case "View All Employees by Department": //Join
                employeeDeptSearch();
                break;
            case "View All Employees by Manager": //Join
                employeeMgrSearch();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Remove Employee":
                removeEmployee();
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
                connection.end();
        }
    })
}


// View all employees
function employeeSearch() {
    var queryOne = "SELECT employee.id, first_name, last_name, role.title, department.name, employee.manager_id ";
    queryOne += "FROM employee join (role join department ON department.id = role.department_id) ";
    queryOne += "ON employee.role_id = role.id";
    connection.query(queryOne, function (err, res) {
        if (err) throw err;
        console.table(['ID', 'FirstName', 'LastName', "Title", "Department", "Manager"], res)
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
                "Sales",
                "Marketing",
                "HR",
                "Finance",
                "IT",
                "Engineering",
                "Legal",
                "Digital"
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
                    choices: function () {
                        let roleOpts = [];
                        for (let i = 0; i < roles.length; i++) {
                            roleOpts.push({
                                name: roles[i].title,
                                value: roles[i].id
                            })
                        }
                        return roleOpts
                    }
                },
                {
                    name: "manager",
                    type: "list",
                    message: "Select employee's manager by last name:",
                    choices: function () {
                        let managerOpts = [];
                        for (let i = 0; i < managers.length; i++) {
                            managerOpts.push({
                                name: managers[i].first_name + " " + managers[i].last_name,
                                value: managers[i].id
                            })
                            return managerOpts
                        }
                    }
                }
            ]).then(function (answer) {

                var queryFive = `INSERT INTO employee (first_name, last_name, role_id, manager_id)`;
                queryFive += `VALUES (?,?,?,?)`;

                connection.query(queryFive, [answer.firstname, answer.lastname, answer.position, answer.manager], function (err, res) {
                    if (err) throw err;
                    employeeSearch();
                    runSearch();
                })
            })
        })
    })
}


function removeEmployee() {
    inquirer.prompt([
        {
            name: "name",
            type: "list",
            message: "Which employee would you like to remove?",
            choices: employee
        }
    ]).then(function (answer) {
        connection.query("SELECT id from employee where first_name && last_name = ?", [answer.name], function (err, res) {
            console.log(res[0])
        })




    })

}

function updateRole() {

}

function updateMgr() {

}

function addRole() {
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
            choices: [
                "Sales",
                "Marketing",
                "HR",
                "Finance",
                "IT",
                "Engineering",
                "Legal",
                "Digital"
            ]
        }
    ]).then(function (answer) {
        connection.query("SELECT id FROM department where name = ?", [answer.dept], function (err, res) {
            let deptName = res[0].id
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?,?,?)", [answer.role, answer.salary, deptName], function (err, res) {
                console.log("success")
            })
        })

    })

}

function removeRole() {
    inquirer.prompt([
        {
            name: "role",
            type: "list",
            message: "What role would you like to remove?",
            choices: roles
        }
    ]).then(function (answer) {

        connection.query("DELETE FROM role where title = ? ", [answer.role], function (err, res) {
            console.log(res)
            connection.query("SELECT * FROM role", function (err, res) {
                console.table(['ID', "Title"], res)
            })
        })
    })
};
