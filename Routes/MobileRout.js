const express = require("express")
const mobile=require('../Controllers/moblieController')
const patient=require('../Controllers/PatientController')
const route=express.Router()
module.exports=route;

//new account
route.post('/newaccount',mobile.newaccount)
//login
route.post('/login',mobile.login)
//get all doctors
route.get('/getDoctors/:address/:day',mobile.getDoctors)
//show booking
route.get('/showBooking/:mobilePat',mobile.showBooking)
//update account
route.patch('/updateaccount/:mobilePat',mobile.updateaccount)
//book doctor
route.post('/bookdoctor',mobile.makebook)
//rate doctor
route.patch('/reatedoctor',mobile.ratedoctor)
//getaccount
route.get('/getaccount/:mobile',patient.getaccount)
//get appoint
route.get('/getappoint/:mobile',mobile.getappointment)
//get all doctors with schedule
route.get('/getDoctorswithsc/:mobile',mobile.getDoctors2)


