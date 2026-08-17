const response=(res,statusCode,message,data=null)=>{
    if(!res){
        console.error(`Response Object is null`);
    }
    const responseObj={
        status:statusCode<400 ? 'success':'error' ,
        message,
        data
       }

       return res.status(statusCode).json(responseObj);
}

export default response;