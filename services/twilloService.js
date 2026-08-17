import twilio from 'twilio';


//Twilio Credentials from env


const accountSid=process.env.TWILIO_SID
const authToken=process.env.TWILIO_AUTH
const serviceSid=process.env.TWILIO_SERVICE_SID


const client =twilio(accountSid,authToken);

//sendOtp to phone_number


const sendOtpToPhoneNumber=async(phoneNumber)=>{
    try{
        console.log(`sending otp to this number ${phoneNumber}`);
        if(!phoneNumber){
            throw new Error(`PhoneNumber is required`);
        }
        const response=await client.verify.v2.services
    }
}