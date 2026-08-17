import nodeMailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({path:'./.env'});



const transporter =await nodeMailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.PASSWORD,
    }
});


transporter.verify((error,success)=>{
    if(error){
        console.log(`Gmail services connection failed`);
    }
    else{
        console.log(`Gmail configured successfully ready to send email`);
    }
});


const sendOtpToEmail=async(email,otp)=>{
   const html = `
<div style="margin:0;padding:30px;background:#f3f7ff;font-family:Arial,Helvetica,sans-serif;">

  <div style="
      max-width:620px;
      margin:auto;
      background:#ffffff;
      border-radius:18px;
      overflow:hidden;
      box-shadow:0 12px 30px rgba(0,0,0,0.08);
      border:1px solid #e5e7eb;
  ">

    <!-- Header -->
    <div style="
        background:linear-gradient(135deg,#2563eb,#4f46e5);
        padding:35px 20px;
        text-align:center;
    ">
      <h1 style="
          margin:0;
          color:#ffffff;
          font-size:34px;
          letter-spacing:1px;
      ">
        💬 ChitChat
      </h1>

      <p style="
          margin-top:10px;
          color:#dbeafe;
          font-size:15px;
      ">
        Secure Email Verification
      </p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">

      <h2 style="
          margin-top:0;
          color:#111827;
          font-size:28px;
      ">
        Verify Your Email
      </h2>

      <p style="
          font-size:16px;
          color:#4b5563;
          line-height:1.8;
      ">
        Hello,
      </p>

      <p style="
          font-size:16px;
          color:#4b5563;
          line-height:1.8;
      ">
        Welcome to <strong>ChitChat</strong> 🎉<br><br>

        To complete your registration, please enter the verification code below.
      </p>

      <!-- OTP -->
      <div style="text-align:center;margin:40px 0;">

        <div style="
            display:inline-block;
            padding:18px 40px;
            background:linear-gradient(135deg,#eef4ff,#dbeafe);
            border:2px dashed #2563eb;
            border-radius:14px;
        ">

          <span style="
              font-size:38px;
              font-weight:bold;
              color:#2563eb;
              letter-spacing:10px;
          ">
            ${otp}
          </span>

        </div>

      </div>

      <!-- Alert Box -->
      <div style="
          background:#fff8e6;
          border-left:5px solid #f59e0b;
          padding:15px;
          border-radius:8px;
          margin-bottom:25px;
      ">

        <p style="
            margin:0;
            color:#92400e;
            font-size:15px;
            line-height:1.6;
        ">
          ⏳ This verification code will expire in
          <strong>10 minutes.</strong>
        </p>

      </div>

      <p style="
          font-size:15px;
          color:#6b7280;
          line-height:1.8;
      ">
        If you didn't request this email, you can safely ignore it.
        No changes will be made to your account.
      </p>

      <hr style="
          border:none;
          border-top:1px solid #e5e7eb;
          margin:35px 0;
      ">

      <p style="
          color:#374151;
          line-height:1.8;
          margin-bottom:0;
      ">
        Regards,<br>
        <strong style="color:#2563eb;">
          Team ChitChat 💙
        </strong>
      </p>

    </div>

    <!-- Footer -->
    <div style="
        background:#f9fafb;
        padding:25px;
        text-align:center;
        border-top:1px solid #e5e7eb;
    ">

      <p style="
          margin:0;
          color:#6b7280;
          font-size:14px;
      ">
        You're receiving this email because a verification request
        was made for your ChitChat account.
      </p>

      <p style="
          margin-top:12px;
          color:#9ca3af;
          font-size:13px;
      ">
        © 2026 ChitChat. All Rights Reserved.
      </p>

    </div>

  </div>

</div>
`;

await transporter.sendMail({
    from:process.env.EMAIL_USER,
    to:email,
    subject:`Your Otp for Chat-App is`,
    html:html
})
};


export default sendOtpToEmail;