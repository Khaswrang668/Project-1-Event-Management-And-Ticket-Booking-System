/*import {app} from './app.js'
import{connectDB} from './db/index.js'
import 'dotenv/config'

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000 , ()=>{
    console.log(`server is running at port http://localhost:${process.env.PORT}`)
})
})
.catch((err)=>{
    console.log(`cannot connect Database and server, ${err}`);
})*/

import { app } from './app.js'
import { connectDB } from './db/index.js'
import 'dotenv/config'

// 1. Immediately connect to the Database
connectDB()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log(`Database connection failed: ${err}`);
  });

// 2. Only run app.listen if you are working locally
// (Vercel sets process.env.NODE_ENV to 'production' automatically)
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running at port http://localhost:${process.env.PORT || 3000}`);
  });
}

export default app;