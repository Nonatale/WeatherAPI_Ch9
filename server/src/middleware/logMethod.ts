
const logMethod = (req: any, _res: any, next: any) => {
    console.log(`${req.method} request received.`);
    console.log('======================');
    next();
  };
  
  export default logMethod;