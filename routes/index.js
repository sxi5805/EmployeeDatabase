var express = require('express');
var router = express.Router();

var sql = require("mssql");

// config for your database
var config = {
    user: 'foodadmin',
    password: 'foodadmin123',
    server: 'localhost',
    database: 'Employee'
};

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


//view employees
router.post('/api/view', function (req, res) {
    var Emp_id=parseInt(req.body.E_id);
    var dbConn = new sql.Connection(config);
    dbConn.connect().then(function () {
           var request = new sql.Request(dbConn);
           request.query("select Take_Home_Pay from employee_data where E_id="+Emp_id).then(function (recordSet) {
               res.json(recordSet[0]['Take_Home_Pay']);
               dbConn.close();
           }).catch(function (err) {
               console.log(err);
               dbConn.close();
           });
       }).catch(function (err) {
           console.log(err);
       });
});

//addEmployees
router.post('/api/add', function (req, res) {
   console.log(req.body);
    var Emp_id=parseInt(req.body.E_id);
    var base_Salary=parseInt(req.body.base_Salary);
    var retire=parseInt(req.body.retire);
    var medical=parseInt(req.body.medical);
    var state=parseInt(req.body.state);
    var federal=parseInt(req.body.federal);
    var others=parseInt(req.body.others);
    var deductions=retire+medical+state+federal+others;
    var take_Home_Pay=base_Salary-deductions;
    console.log(Emp_id+","+base_Salary+","+deductions+","+take_Home_Pay);
    var dbConn = new sql.Connection(config);

    dbConn.connect().then(function () {
           var request = new sql.Request(dbConn);
           request.query("insert into employee_deductions values("+Emp_id+","+retire+","+medical+","+state+","+federal+","+others+")").then(function (recordSet) {
               //res.json();
               //dbConn.close();
           }).catch(function (err) {
               console.log(err);
           });
           request.query("insert into employee_data values("+Emp_id+","+deductions+","+take_Home_Pay+","+base_Salary+")").then(function (recordSet) {
               //res.json();
           }).catch(function (err) {
               console.log(err);
           });
           dbConn.close();
       }).catch(function (err) {
           console.log(err);
       });

});
//
// //edit/column
router.post('/api/edit', function (req, res) {
    var Emp_id=parseInt(req.body.E_id);
    var column_Name=req.body.column_Name;
    var value=parseInt(req.body.value);
    var take_Home_Pay=0;

    console.log(req.body);
    //console.log(column_Name==="base_Salary");
    if(column_Name==="Base Salary"){
      //console.log("if");
      var dbConn = new sql.Connection(config);
      dbConn.connect().then(function () {
             var request = new sql.Request(dbConn);
             request.query("select Deductible_amt from employee_data where E_id="+Emp_id).then(function (recordSet) {
                  deductions=recordSet[0]['Deductible_amt'];
                  take_Home_Pay=value-deductions;
                  console.log(take_Home_Pay);
                  request.query("update employee_data set Base_Salary="+value+","+"Take_Home_Pay="+take_Home_Pay+" where E_id="+Emp_id).then(function (recordSet) {
                      dbConn.close();
                  }).catch(function (err) {
                      console.log(err);
                  });
             }).catch(function (err) {
                 console.log(err);
             });
         }).catch(function (err) {
             console.log(err);
         });
       }

    else {
      console.log("else");
      var dbConn = new sql.Connection(config);
      dbConn.connect().then(function () {
             var request = new sql.Request(dbConn);
             request.query("select "+column_Name+" from employee_deductions where E_id="+Emp_id).then(function (recordSet) {
                 var oldValue=recordSet[0][column_Name];
                 console.log(oldValue+" old value");
                 request.query("update employee_deductions set "+column_Name+"="+value+"where E_id="+Emp_id).then(function (recordSet) {
                   request.query("select Deductible_amt from employee_data where E_id="+Emp_id).then(function (recordSet) {
                       var deductionsOld=recordSet[0]['Deductible_amt'];
                        var newDeduction=deductionsOld-oldValue+value;
                        request.query("select base_Salary from employee_data where E_id="+Emp_id).then(function (recordSet) {
                          var base_Salary=recordSet[0]['base_Salary'];
                            var newTakeHome=base_Salary-newDeduction;
                            console.log(oldValue+" "+deductionsOld+" "+newDeduction+" "+newTakeHome);
                            request.query("update employee_data set Deductible_amt="+newDeduction+",Take_Home_Pay="+newTakeHome+" where E_id="+Emp_id).then(function (recordSet) {
                               dbConn.close();
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }).catch(function (err) {
                            console.log(err);
                           // dbConn.close();
                        });
                   }).catch(function (err) {
                       console.log(err);
                   });
                 }).catch(function (err) {
                     console.log(err);
                 });
             }).catch(function (err) {
                 console.log(err);
             });
         }).catch(function (err) {
             console.log(err);
         });

    }

});

//deleteEmp
router.post('/api/delete', function (req, res) {
    var Emp_id=parseInt(req.body.E_id);
    var dbConn = new sql.Connection(config);
    dbConn.connect().then(function () {
           var request = new sql.Request(dbConn);
           request.query("delete from employee_data where E_id="+Emp_id).then(function (recordSet) {
              // dbConn.close();
           }).catch(function (err) {
               console.log(err);
               //dbConn.close();
           });
           request.query("delete from employee_deductions where E_id="+Emp_id).then(function (recordSet) {
              // dbConn.close();
           }).catch(function (err) {
               console.log(err);
               //dbConn.close();
           });
           dbConn.close();
       }).catch(function (err) {
           console.log(err);
       });
});

router.post('/api/checkEmp', function (req, res) {
  //console.log(req.body);
    var Emp_id=parseInt(req.body.E_id);
    //console.log(Emp_id);
    var dbConn = new sql.Connection(config);
    dbConn.connect().then(function () {
           var request = new sql.Request(dbConn);
           request.query("SELECT TOP 1 E_id FROM employee_data where E_id="+Emp_id).then(function (recordSet) {
              if(recordSet[0]==undefined){
                res.json(false);
              }
              else{
                res.json(true);
              }
               //console.log(recordSet[0]==undefined);
               dbConn.close();
           }).catch(function (err) {
               console.log(err);
               dbConn.close();
           });
       }).catch(function (err) {
           console.log(err);
       });
});



module.exports = router;
