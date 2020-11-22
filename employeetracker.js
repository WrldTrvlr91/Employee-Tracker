const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const chalk = require("chalk");
const figlet = require("figlet");
const { Console } = require("console");

//Creates App header
console.log(
  chalk.cyanBright(
    figlet.textSync("Employee Tracker", { horizontalLayout: "full"})
  ),"\n","\n"
);

const db = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "fj5867HJC74^$VBR#D5677b",
  database: "employeeTracker_DB"
});

db.connect(function (err) {
  if (err) throw err;
  console.log("\n","Welcome, you have successfully Connected to DB!","\n");
  employeeCMD();
});

//Inquirer questions
function employeeCMD() {
  inquirer
    .prompt({
      name: "mastertodoquestion",
      type: "list",
      message: chalk.green("What would you like to do?"),
      choices: [
        "View All Employees",
        "View Employees By Department",
        "View Employees By Manager",
        "View All Departments",
        "View All Roles",
        "Add New Department",
        "Add New Employee",
        "Add New Role",
        "Update Employee Role",
        "View total Utilized Budget By Department",
      ]
    })
    .then(function (result) {
      switch (result.mastertodoquestion) {
        case "View All Employees":
          allEmployeeSearch();
          break;
        case "View All Departments":
          allDepartmentSearch();
          break;
        case "View All Roles":
          allRolesSearch();
          break;
        case "View Employees By Department":
          allEmployeebyDept();
          break;
        case "Add New Department":
          addDepartment();
          break;
        case "Add New Employee":
          addEmployee();
          break;
        case "Add New Role":
          addRole();
          break;
        case "View Employees By Manager":
          allEmployeeByManager();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "View total Utilized Budget By Department":
          totalUtilizedBudget();
          break;
          
      }


    });
}

// All employee query search
function allEmployeeSearch() {
  let sql = "SELECT e.id AS 'Employee ID',CONCAT(e.first_name,' ',e.last_name) AS Employee,role.title AS Position,role.salary AS Salary,CONCAT(m.first_name,' ',m.last_name) AS Manager,department.name AS Department FROM employee e LEFT JOIN employee m ON m.id = e.manager_id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY e.id";
  db.query(sql, function (err, res) {
    if (err) throw err;
    console.log(chalk.magenta.bold("\n", "ALL EMPLOYEE RESULTS", "\n"));
    console.table(res);
    employeeCMD();
  });
}

//Return all employees by under selected department
function allEmployeebyDept(){
  let deptArray = [];
  // Query to get all departments
  let sql = "SELECT * FROM department ORDER BY id";
  db.query(sql, function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      deptArray.push(res[i].id + " - " + res[i].name);
    }
    inquirer
      .prompt(
        {
          name: "alldept",
          type: "list",
          message: "Select a department to find all related employees:",
          choices: deptArray
        }
      ).then(function (result) {
        //get selected dept id
        let deptID = result.alldept.substr(0, result.alldept.indexOf(" -"));
        //Find all employees who are under selected department and console table
        let sql = "SELECT e.id AS 'Employee ID',CONCAT(e.first_name,' ',e.last_name) AS Employee,role.title AS Position,role.salary AS Salary,CONCAT(m.first_name,' ',m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON m.id = e.manager_id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE role.department_id = ? ORDER BY e.id";
        db.query(sql, [deptID], function (err, res) {
          if (err) throw err;
          console.log(
            chalk.magenta.bold("\n", "ALL EMPLOYEES REPORTING UNDER - " + result.alldept + "\n"));
          console.table(res);
          employeeCMD();
        })
      });
  });
}

//Return all employees managed by selected employee
function allEmployeeByManager() {
  let managerArray = [];
  // Query for all employees for have manager duties
  let sql = "SELECT DISTINCT CONCAT(m.id,' - ',m.first_name,' ',m.last_name) AS Manager FROM employee e INNER JOIN employee m ON m.id = e.manager_id";
  db.query(sql, function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      managerArray.push(res[i].Manager);
    }
    inquirer
      .prompt(
        {
          name: "allmanagers",
          type: "list",
          message: "Select a manager to find all reporting employees:",
          choices: managerArray
        }
      ).then(function (result) {
        //get selected employee id
        let managerID = result.allmanagers.substr(0, result.allmanagers.indexOf(" -"));
        //Find all employees who report to selected employee and console table
        let sql = "SELECT employee.id AS 'Employee ID',CONCAT(employee.first_name,' ',employee.last_name) AS Employee, role.title AS Position, role.salary AS Salary,department.name AS Department FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE manager_id = ? ORDER BY employee.id";
        db.query(sql, [managerID], function (err, res) {
          if (err) throw err;
          console.log(
            chalk.magenta.bold("\n", "ALL EMPLOYEES MANAGED BY - " + result.allmanagers + "\n"));
          console.table(res);
          employeeCMD();
        })
      });
  });
}

//All department query search
function allDepartmentSearch() {
  let sql = "SELECT * FROM department ORDER BY id";
  db.query(sql, function (err, res) {
    if (err) throw err;
    console.log(chalk.magenta.bold("\n", "ALL DEPARTMENT RESULTS", "\n"));
    console.table(res);
    employeeCMD();
  });
}

//All role query search
function allRolesSearch() {
  let sql = "SELECT * FROM role ORDER BY id";
  db.query(sql, function (err, res) {
    if (err) throw err;
    console.log(chalk.magenta.bold("\n", "ALL ROLE RESULTS", "\n"));
    console.table(res);
    employeeCMD();
  });
}

//Add department name to table department
function addDepartment() {
  inquirer
    .prompt({
      name: "departmentname",
      type: "input",
      message: "Enter new department name",
    })
    .then(function (result) {
      let sql = "INSERT INTO department (name) VALUES ('" + result.departmentname + "');"
      db.query(sql, function (err, res) {
        if (err) throw err;
        console.log(chalk.magenta.bold("\n", "SUCCESSFULLY ADDED NEW DEPARTMENT;","\n"),chalk.yellow("Department: "+ result.departmentname,"\n"));
        employeeCMD();
      });
    });
}

//Add Employee to table employee
function addEmployee() {
  let roleArray = [];
  let managerArray = [];
  // Get roles and create array of choices
  let sql = "SELECT id, title FROM role ORDER BY id";
  db.query(sql, function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      roleArray.push(res[i].id + " - " + res[i].title);
    }
    let sql = "SELECT id, first_name, last_name FROM employee ORDER BY id";
    db.query(sql, function (err, res) {
      if (err) throw err;
      for (i = 0; i < res.length; i++) {
        managerArray.push(res[i].id + " - " + res[i].first_name + " " + res[i].last_name);
      }
      inquirer
        .prompt([{
          name: "employeefirstname",
          type: "input",
          message: "Enter employees first name:"
        },
        {
          name: "employeelastname",
          type: "input",
          message: "Enter employees last name:"
        },
        {
          name: "assignrole",
          type: "list",
          message: "Assign role to employee:",
          choices: roleArray
        },
        {
          name: "assignmanager",
          type: "list",
          message: "Assign manager to employee:",
          choices: managerArray
        }
        ])
        .then(function (result) {
          //get selected role id
          let roleID = result.assignrole.substr(0, result.assignrole.indexOf(" -"));
          // get selected manager id
          let managerID = result.assignmanager.substr(0, result.assignmanager.indexOf(" -"));
          // create new role query
          let sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('" + result.employeefirstname + "', '" + result.employeelastname + "', " + roleID + ", " + managerID + ");"
          db.query(sql, function (err, res) {
            if (err) throw err;
            console.log(
              chalk.magenta.bold("\n", "SUCCESSFULLY ADDED NEW EMPLOYEE;","\n"),
              chalk.yellow("Employee Name: " + result.employeefirstname + " " + result.employeelastname, "\n","Role: " + result.assignrole,"\n","Manager: " + result.assignmanager,"\n")
              );
            
            employeeCMD();
          });
        });
    });
  });
}

//Add role to table role and assign department
function addRole() {
  let departmentArray = [];
  // Get departments and create array of choices
  let sql = "SELECT * FROM department ORDER BY id";
  db.query(sql, function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      departmentArray.push(res[i].id + " - " + res[i].name);
    }
    inquirer
      .prompt([{
        name: "rolename",
        type: "input",
        message: "Enter new role name:",
      },
      {
        name: "salaryamount",
        type: "number",
        message: "Enter salary as a whole number eg 50000:",
      },
      {
        name: "alldepartments",
        type: "list",
        message: "Select a department and assign it to the new role:",
        choices: departmentArray
      }
      ])
      .then(function (result) {
        //get selected department id
        let departmentID = result.alldepartments.substr(0, result.alldepartments.indexOf(" -"));
        // create new role query
        let sql = "INSERT INTO role (title, salary, department_id) VALUES ('" + result.rolename + "', " + result.salaryamount + ", " + departmentID + ");"
        db.query(sql, function (err, res) {
          if (err) throw err;
          console.log(chalk.magenta.bold("\n", "SUCCESSFULLY ADDED NEW ROLE;","\n"),chalk.yellow("Role: " + result.rolename, "\n","Salary: " + result.salaryamount,"\n", "Department: " + result.alldepartments,"\n"));
          employeeCMD();
        });
      });
  });
}

// Update employee current role
function updateEmployeeRole() {
  let employeeArray = [];
  let rolesArray = [];
  let sql = "SELECT id, first_name, last_name FROM employee ORDER BY id";
  db.query(sql, function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      employeeArray.push(res[i].id + " - " + res[i].first_name + " " + res[i].last_name);
    }
    let sql = "SELECT id, title FROM role";
    db.query(sql, function (err, res) {
      if (err) throw err;
      for (i = 0; i < res.length; i++) {
        rolesArray.push(res[i].id + " - " + res[i].title);
      }
      inquirer
        .prompt([
          {
            name: "allemployees",
            type: "list",
            message: "Select an employee to update role:",
            choices: employeeArray
          },
          {
            name: "allroles",
            type: "list",
            message: "Select new role:",
            choices: rolesArray
          }
        ]).then(function (result) {
          let employeeID = result.allemployees.substr(0, result.allemployees.indexOf(" -"));
          let roleID = result.allroles.substr(0, result.allroles.indexOf(" -"));
          // create new role query
          let sql = "UPDATE employee SET role_id = " + roleID + " WHERE id = ?";
          db.query(sql, [employeeID], function (err, res) {
            if (err) throw err;
            
            console.log(
              chalk.magenta.bold("\n","SUCESSFULLY UPDATED EMPLOYEE ROLE;","\n"),
              chalk.yellow("Employee Name: " + result.allemployees,"\n", "New Role: " + result.allroles,"\n")
              );
            employeeCMD();
          });
        });
    });
  });
}

//Return total budget used by department
function totalUtilizedBudget(){
  let deptArray = [];
  // Query to get all departments
  let sql = "SELECT * FROM department ORDER BY id";
  db.query(sql, function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      deptArray.push(res[i].id + " - " + res[i].name);
    }
    inquirer
      .prompt(
        {
          name: "alldept",
          type: "list",
          message: "Select a department to identify total used budget:",
          choices: deptArray
        }
      ).then(function (result) {
        let totalSalaryArray = []; 
        //get selected dept id
        let deptID = result.alldept.substr(0, result.alldept.indexOf(" -"));
        //Find all employees who are under selected department and console table
        let sql = "SELECT role.salary AS Salary FROM employee  INNER JOIN role ON employee.role_id = role.id  INNER JOIN department ON role.department_id = department.id WHERE role.department_id = ?";
        db.query(sql, [deptID], function (err, res) {
          if (err) throw err;
          for (i = 0; i < res.length; i++) {
            totalSalaryArray.push(res[i].Salary);
          }
          console.log(
            chalk.magenta.bold("\n","TOTAL SALARIES BY DEPARTMENT - " + result.alldept,"\n"),
            chalk.yellow("Total salaries for all employees is $" + totalSalaryArray.reduce((a,b) => a + b, 0),"\n")
            );
          employeeCMD();
        })
      });
  });
}