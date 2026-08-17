import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/dbConfig.js";
// import bodyParser from 'body-parser';
import authRouter from "./routes/auth.route.js";
import statusRouter from "./routes/status.route.js";
import chatRouter from "./routes/chat.route.js";
import initializeSocket from "./services/socketService.js";

const app = express();

 const allowedOrigins = [
  "https://chat-app-frontend-five-lime.vercel.app",
  "http://localhost:5173"
];
const corsOption = {
  origin: (origin, callback) => {

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }

  },
  credentials: true
};
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());//parse token

import http from "http";
const PORT = process.env.PORT||5000;

console.log(PORT);

connectDB();
const server=http.createServer(app);

const io=initializeSocket(server);

//apply socket middleware before every route.
app.use((req,res,next)=>{
  req.io=io;
  req.socketUserMap=io.socketUserMap;

  next();
})

app.use('/api/auth',authRouter);
app.use('/api/chats',chatRouter);
app.use("/api/status",statusRouter);
app.get("/", (req, res) => {
  res.send("Main yahi hoon");
});

server.listen(PORT, () => {
    
  console.log(`Server running on port ${PORT}`);
});