const bcrypt=require("bcrypt")
const patientmodel=require('../Model/patientModel')
const doctormodel=require('../Model/DoctorModel')
const schedulemodel=require('../Model/scheduleModel')
const bookDocModel=require('../Model/bookDocModel')



// @desc create newaccount for patient
let newaccount=async(req,res)=>{
    //res.set("Access-Control-Allow-Origin","*")

    const patient = await patientmodel.findOne({mobile:req.body.mobile,email:req.body.email}).exec()
 
    if(patient){
        return res.status(401).send("patient exist")
    }
    const mybody=req.body
    
    const newPat=new patientmodel(mybody)
    newPat.save().then(()=>{
   
         res.status(200).send("patient added successfull")
        
    }).catch((err)=>{
        for(let e in err.errors){
            console.log(err.errors[e].message)
            res.status(400).send("Bad Request...")
        }
    })

}



// @desc login for patient
let login=async(req,res)=>{
    //res.set("Access-Control-Allow-Origin","*")

    const patient = await patientmodel.findOne({ email:req.body.email,isactive:true }).exec()

    if(patient){
        const comparpass = await bcrypt.compare(req.body.password, patient.password)
        if (!comparpass) {
          return res.status(403).send("invaild username or password");
        
      }
      
      
        res.status(200).send(patient.mobile)
      }else{
        return res.status(404).send("not found");
      }

}




// @desc getDoctors and filter it by address and day
let getDoctors = async(req, res) => {
    const doctors = await doctormodel.find({isactive:true}, { ratearr: 0 }).sort({ rate: -1 }).exec();
  
    if (!doctors || doctors.length === 0) {
      return res.status(400).send("no doctors");
    }
    res.status(200).send(doctors)
  
    
    
  }
 
 
let getDoctors2 = async (req, res) => {
  try {
    const doctors = await doctormodel.find({mobile:req.params.mobile}, { ratearr: 0 }).sort({ rate: -1 }).exec();

    if (!doctors || doctors.length === 0)
      return res.status(404).send("not found");

    // Use Promise.all with map
    const newDoctors = await Promise.all(
      doctors.map(async (e) => {
        const schedule = await schedulemodel.findOne({ doctormobile: e.mobile });
        return { ...e._doc, schedual: schedule };
      })
    );

    return res.status(200).json(newDoctors); // استخدم json بدل stringify+send
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
}


let makebook=async(req,res)=>{
    const checkavail=await bookDocModel.findOne({mobileDoc:req.body.mobileDoc,date:req.body.date,time:req.body.time}).exec()
    if(checkavail){
        return res.status(201).send("booking found in this time")
    }
    const {mobileDoc,mobilePat,date,time} = req.body
    const book=new bookDocModel({mobileDoc,mobilePat,date,time})
    //mobilepat:req.body.mobilepat
    //date:


    book.save().then(()=>{
        res.status(200).send(book)
    }).catch((err)=>{
        for(let e in err.errors){
            console.log(err.errors[e].message)
            res.status(400).send("Bad Request...")
        }
    })

}
// @desc booking  
let booking=async(req,res)=>{
    const day=req.body.day;
    let dayOfWeek = 1; 

    switch (day) {
        case 'sat':
            dayOfWeek = 6;
            break;
        case 'sun':
            dayOfWeek = 0;
            break;
         case 'mon':
            dayOfWeek = 1;
            break;
            case 'tue':
                dayOfWeek = 2;
            break;
            case 'wen':
                dayOfWeek = 3;
            break;
            case 'thu':
                dayOfWeek = 4;
            break;
            case 'fri':
                dayOfWeek = 5;
            break;
    
        default:
            dayOfWeek = 6;
            break;
    }

// Define the current date and time
const currentDate = new Date();

// Calculate the number of milliseconds until the next desired day of the week
const millisecondsPerDay = 24 * 60 * 60 * 1000;  // 1 day in milliseconds
const daysToSaturday = 6 - currentDate.getDay();  // Days until next Saturday
const dayDiff = (dayOfWeek + 7 - daysToSaturday - 1) % 7 + 1;
const nextDay = new Date(currentDate.getTime() + dayDiff * millisecondsPerDay);

// Format the next date as a string
const nextDate = nextDay.toISOString().slice(0, 10);  // YYYY-MM-DD format
const date=new Date(nextDate);


     const doctor=await schedulemodel.findOne({doctormobile:req.body.mobileDoc}).exec();
     let myopj='20:58'
     switch (day) {
        case 'sat':
            myopj=doctor.sattime.endTime; 
            break;
        case 'sun':
            myopj=doctor.suntime.endTime;
            break;
         case 'mon':
            myopj=doctor.montime.endTime;
            break;
            case 'tue':
                myopj=doctor.tuetime.endTime;
            break;
            case 'wen':
                myopj=doctor.wentime.endTime;
            break;
            case 'thu':
                myopj=doctor.thutime.endTime;
            break;
            case 'fri':
                myopj=doctor.fritime.endTime;
            break;
    
        default:
            myopj=doctor.sattime.endTime;
            break;
    }
    //find if start time in book
    const starttime1= await bookDocModel.findOne({date:date}).sort({time:-1}).exec()
    let fntime='20:58';
    if(starttime1){
      
      
        // const [endHours, endMinutes] = myopj.split(':').map(Number);
        // const timeee = new Date(`1970-01-01T${starttime1.time}:00.000Z`);
        // if( timeee.getHours() === endHours && timeee.getMinutes() === endMinutes){
        //     return res.status(203).send("Bussy....")
        // }else{
        //     const [hours, minutes] = fntime.split(':').map(Number);
        //     const dateee = new Date();
        //     dateee.setHours(hours, minutes + 30, 0, 0);
        //     fntime=`${dateee.getHours().toString().padStart(2, '0')}:${dateee.getMinutes().toString().padStart(2, '0')}`

        // }

          // Split the string into hours and minutes
   // Split the start time string into hours and minutes
   const [startHours, startMinutes] = starttime1.time.split(':').map(Number);

   // Split the stop time string into hours and minutes
   const [stopHours, stopMinutes] = myopj.split(':').map(Number);
 
   // Calculate the total number of minutes for the start time
   const startTotalMinutes = startHours * 60 + startMinutes;
 
   // Calculate the total number of minutes for the stop time
   const stopTotalMinutes = stopHours * 60 + stopMinutes;
 
   // Add 30 minutes to the start time
   let newTotalMinutes = startTotalMinutes + 30;
 
   // If the new time exceeds the stop time, return the stop time
   if (newTotalMinutes >= stopTotalMinutes) {
    //  return stopTime;
    return res.status(201).send('bussy...')
   }
 
   // Calculate the hours and minutes for the new time
   const newHours = Math.floor(newTotalMinutes / 60);
   const newMinutes = newTotalMinutes % 60;
 
   // Format the new time as a string
   const newTimeStr = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  fntime=newTimeStr

    }else{
        switch (day) {
            case 'sat':
                fntime=doctor.sattime.startTime; 
                break;
            case 'sun':
                fntime=doctor.suntime.startTime;
                break;
             case 'mon':
                fntime=doctor.montime.startTime;
                break;
                case 'tue':
                    fntime=doctor.tuetime.startTime;
                break;
                case 'wen':
                    fntime=doctor.wentime.startTime;
                break;
                case 'thu':
                    fntime=doctor.thutime.startTime;
                break;
                case 'fri':
                    fntime=doctor.fritime.startTime;
                break;
        
            default:
                fntime=doctor.sattime.startTime;
                break;
        }
        
    }



    const {mobileDoc,mobilePat} = req.body
    const book=new bookDocModel({mobileDoc,mobilePat,date:date,time:fntime})
    //mobilepat:req.body.mobilepat
    //date:


    book.save().then(()=>{
        res.status(200).send(book)
    }).catch((err)=>{
        for(let e in err.errors){
            console.log(err.errors[e].message)
            res.status(400).send("Bad Request...")
        }
    })
    
}



//@desc showBooking for patient
let showBooking=async(req,res)=>{
   
    const show=await bookDocModel.find({mobilePat:req.params.mobilePat}).sort({date:-1}).exec()
    if(!show){
        return res.status(404).send("not found")
    }
    res.status(200).send(show)
   
}


//@desc update account
let updateaccount=async(req,res)=>{
    const body=req.body
    const doc=await patientmodel.findOneAndUpdate({mobile:req.params.mobilePat},body).exec()
    if(!doc){
        return res.status(400).send("notfound")

    }
    res.status(200).send('succsess updating')

}

let ratedoctor=async(req,res)=>{
    const doc=await doctormodel.findOne({mobile:req.body.mobile}).exec()
    if(!doc){
        return res.status(404).send('not found')
    }
    let newrate=0
    if(doc.ratearr.length==0){
        newrate=req.body.rate
        let newratearr=doc.ratearr
        newratearr.push(newrate)
        const doc2=await doctormodel.findOneAndUpdate({mobile:req.body.mobile},{rate:newrate,ratearr:newratearr}).exec()
        if(!doc2){
            return res.status(404).send('not found')
        }
        res.status(200).send("rate success")


    }else{
        let newratearr=doc.ratearr
        newratearr.push(req.body.rate)
        const sum =  newratearr.reduce((acc, curr) => acc + curr, 0);
        const avg = sum /  newratearr.length;
        newrate=avg
        const doc3=await doctormodel.findOneAndUpdate({mobile:req.body.mobile},{rate:newrate,ratearr:newratearr}).exec()
        if(!doc3){
            return res.status(404).send('not found')
        }
        res.status(200).send("rate success")



    }
}

const getappointment = async (req, res) => {
  try {
    const bookings = await bookDocModel
      .find({ mobilePat: req.params.mobile })
      .sort({ date: -1, time: -1 })
      .exec();

    if (!bookings || bookings.length === 0) {
      return res.status(404).send('notfound');
    }

    const doctorMobiles = bookings.map(b => b.mobileDoc);

    const doctors = await doctormodel.find({ mobile: { $in: doctorMobiles } });

    // Build a lookup map
    const doctorMap = {};
    doctors.forEach(doc => {
      doctorMap[doc.mobile] = doc;
    });

    const result = bookings.map(b => {
      const doctor = doctorMap[b.mobileDoc] || {};
      return {
        mobile: b.mobileDoc,
        time: b.time,
        date: b.date,
        firstName: doctor.firstName || '',
        lastName: doctor.lastName || '',
      };
    });

    return res.status(200).send(result);
  } catch (error) {
    console.error('Error in getappointment:', error);
    return res.status(500).send('Server error');
  }
};











module.exports={newaccount,login,getDoctors,showBooking,updateaccount,booking,ratedoctor,getappointment,getDoctors2,makebook};
