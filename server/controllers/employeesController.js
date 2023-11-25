const { id } = require('date-fns/locale');
const Employee=require('../model/Employee');
const e = require('cors');

const getAllEmployees= async(req,res)=>{
   const employees=await Employee.find();
   if(!employees) return res.sendStatus(204).json({'message':'No employees found'});
   res.json(employees);
}

const createNewEmployee= async (req,res)=>{
    if(!req?.body?.firstname||!req?.body?.lastname){
        return res.status(400).json({'message':'Fisrt name and last name required'});
    }
    try{
        const result=await Employee.create({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
        });
        res.sendStatus(201).json(result);
    }catch(err){
        console.log(err)
    }
//     const newEmployees={
//    id:data.employees?.length ? data.employees[data.employees.length-1].id+1:1,
//    firstname: req.body.firstname,
//    lastname:req.body.lastname
// }
// if(!newEmployees.firstname||!newEmployees.lastname){
// return res.status(400).json({'message':'Fisrt name and last name required'});
// }
// data.setEmployees([...data.employees,newEmployees]);
// res.status(201).json(data.employees);
}

const updateEmployee= async (req,res)=>{
   if(!req?.body?.id){
    res.status(400).json({'message':`ID parameter is required`});
    }
    const employee=await Employee.findOne({_id:req.body.id}).exec();
    if(!employee){
        res.sendStatus(204).json({"message":`No employee matches ID ${req.body.id}`});
    }
   if(req.body?.firstname)employee.firstname=req.body.firstname;
   if(req.body?.lastname)employee.lastname=req.body.lastname;
   const result=await employee.save()
   res.json(result);
}
const deleteEmployee= async (req,res)=>{
    if(!req?.body?.id){
        res.status(400).json({'message':`ID is required`});
        }
    const employee=await Employee.findOne({_id:req.body.id}).exec();
    if(!employee){
        res.sendStatus(204).json({'message':`No employee matches ID ${req.body.id}`});
    }
    const result=await employee.deleteOne({_id:req.body.id});
    res.json(result);
}

const getEmployee= async (req,res)=>{
    if(!req?.params?.id){
        res.status(400).json({'message':`ID is required`});
        }
        const employee=await Employee.findOne({_id:req.params.id}).exec();
    if(!employee){
        res.status(400).json({'message':`Employee id ${req.params.id} not found`});
    }
    res.json(employee);
}
module.exports={
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee
}