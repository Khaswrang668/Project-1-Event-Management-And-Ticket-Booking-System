import axios from 'axios';
import 'dotenv/config';

//Get authorization token from phone pe business portal
export const getPhonePeAuthToken = async () => {
    try{

    const response = await axios.post(
    'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
    new URLSearchParams({
        client_id: process.env.PHONEPE_CLIENT_ID,
        client_version: process.env.PHONEPE_CLIENT_VERSION,
        client_secret: process.env.PHONEPE_CLIENT_SECRET,
        grant_type: "client_credentials"
    }),
    {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }
    )

    console.log(response)
    return response.data.access_token;
    }
    catch (error){

    console.error("Auth error:", error.response?.data || error.message);
    throw error;
    }
}