//write cleaner code for ticket generation again
//ticket with pdfkit should be sepearted from QR encoding
//logic flow:- user enter data(frontend)->ticket controller caputers it->creates ticket object
// ->pass on ticketId to ticketgeneration function->ticket gen function calls QRcode generator
//with ticketId as input -> final downloadable pdf back to browser
//use puppeter instead of pdfkit

import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { Events } from "../../models/event.model.js";
import { Tickets } from "../../models/ticket.model.js";
import { ticketTemplate } from "./ticket.HTML.template.js"
import { generateQRCode } from "./QRcodeEncoding.js"

export const generateTicketPDF = async (ticketId,eventId,qrToken)=>{
   const ticket = await Tickets.findById(ticketId);
   const event = await Events.findById(eventId);

   //Generate Qrcode buffer 
   const qrData = await generateQRCode(ticketId,qrToken)

   //Create the HTML template for ticket and pupeeter
   const template = ticketTemplate(ticket,event,qrData)

   try{
       const browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: process.env.NODE_ENV === 'production'
          ? await chromium.executablePath()
          : puppeteer.executablePath(),
        headless: true,
      })
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
      console.log("Error has ocurred:",error)
   }
}

