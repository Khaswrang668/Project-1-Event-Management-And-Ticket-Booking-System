import { randomUUID } from 'crypto'
import axios from 'axios'
import { getPhonePeAuthToken } from './getAuthToken.phonePe.js'
import { randomUUID } from 'crypto'

//Create a phonePe payment request
export const paymentRequest = async (paymentAmount)=>{
    try{
    const merchantOrderId = randomUUID();
    
    const authToken = await getPhonePeAuthToken(); 
    
    const payload = {
    "merchantOrderId": merchantOrderId,
    "amount": paymentAmount * 100, 
    "expireAfter": 1200,
    "paymentFlow": {
        "type": "PG_CHECKOUT",
        "message": "Payment message used for collect requests",
        "merchantUrls": {
            "redirectUrl": "https://developer.phonepe.com/" 
        }
    },
    "disablePaymentRetry": true,
    "metaInfo": {
        "udf1": "additional-information-1",
        "udf2": "additional-information-2",
        "udf3": "additional-information-3",
        "udf4": "additional-information-4",
        "udf5": "additional-information-5",
        "udf6": "additional-information-6",
        "udf7": "additional-information-7",
        "udf8": "additional-information-8",
        "udf9": "additional-information-9",
        "udf10": "additional-information-10",
        "udf11": "additional-information-11",
        "udf12": "additional-information-12",
        "udf13": "additional-information-13",
        "udf14": "additional-information-14",
        "udf15": "additional-information-15"
    }
   }

    const response = await axios.post("https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay",
        payload,
        {
        headers: {
           "Content-Type" : "application/json",
           "Authorization" : `Bearer ${authToken}` 
          }
        }
    );

    const data = {
        "redirectUrl": response.data.data.redirectUrl,
        "merchantOrderId": merchantOrderId
    };

    return data;
    }
    catch (error){
        console.error("Payment error:",error.message);
        throw error; 
    }
}
