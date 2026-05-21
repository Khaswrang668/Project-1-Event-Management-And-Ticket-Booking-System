import { Tickets } from "../../models/ticket.model"
import { Bookings } from "../../models/booking.model"
import puppeteer  from "puppeteer"
import { getHTMLtemplate } from "getCertificate.temp.HTML.js"
import { Users } from "../../models/user.model"
import { Events } from "../../models/event.model"

export const generateCertificate = async(certificateId,ticketId,bookingId)=>{

    const ticket = await Tickets.findById(ticketId);
    const booking = await Bookings.findById(bookingId).populate('user').populate('event');
    const user = await Users.findById(booking.user._id);
    const event = await Events.findById(booking.event._id);
    
    const template = getHTMLtemplate(ticket,booking,user,event);

    try{
       const browser = await puppeteer.launch();
       const page = await browser.newPage();
      
            await page.setContent(template)
            await page.emulateMediaType("screen");
      
            const pdfData = await page.pdf({
              format: "A4",
              printBackground: true
            })
            
        await browser.close()
      
        return pdfData;
    }
    catch(error){
       console.log("Failed in certificate geneartion",error)
    }
}