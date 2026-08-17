import jwt from 'jsonwebtoken';
;


const generateToken=(userId)=>{
    return jwt.sign({userId},process.env.TOKEN_SECRET,{
        expiresIn:'1y',
    })
}

export default generateToken;