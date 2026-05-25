import { randomUUID } from 'crypto'
import axios from 'axios'
import { getPhonePeAuthToken } from './getAuthToken.phonePe.js'

//Create a phonePe payment request
export const paymentRequest = async (paymentAmount,phoneNo)=>{
    try{
    const merchantOrderId = randomUUID().replace(/-/g, '').slice(0, 63)//Phonepe allows strings of max 63 length only and no hypens or underscores
    console.log(`merchantOrderID and lenght with phoneNo: ${merchantOrderId} ${merchantOrderId.length} ${phoneNo}`)

    const authToken = await getPhonePeAuthToken(); 
    console.log(`I'm getting back authToken ${authToken}`)
    
    const payload = {
    "merchantOrderId": merchantOrderId,
    "amount": paymentAmount * 100, 
    "expireAfter": 1200,
    "paymentFlow": {
        "type": "PG_CHECKOUT",
        "message": "Payment message used for collect requests",
        "merchantUrls": {
          "redirectUrl": `${process.env.FRONTEND_URL}/payment/callback?merchantOrderId=${merchantOrderId}`
        }
    },
    "prefillUserLoginDetails": { //<- Fix: forgot to add this field it was mandotary
        "phoneNumber": `+91 ${phoneNo}` //<- Fix: fixed the correct phone number format
     },
    "disablePaymentRetry": true
   }

    const response = await axios.post("https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay",
        payload,
        {
        headers: {
           "Content-Type" : "application/json",
           "Authorization" : `O-Bearer ${authToken}` //Fixed correct format should be O-Bearer not Bearer Only
          }
        }
    );
    
    //console.log("PhonePe response:", JSON.stringify(response.data, null, 2)) // add this

    const data = {
        "redirectUrl": response.data.redirectUrl,//Fixed it's response.data.redirectUrl not reponse.data.data.redirectUrl
        "merchantOrderId": merchantOrderId
    };
   
    return data;
    }
    catch (error) {
    console.error("Payment error:", JSON.stringify(error.response?.data, null, 2))
    throw error
}
}

//Not mandotary
/*"metaInfo": {
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
    }*/