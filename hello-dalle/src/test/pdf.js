import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@^1.11.1?dts';

import { say } from "../shared/cli.ts";
import { promptDalle } from "../shared/openai.ts";
import { LogLevel, setLogLevel } from "../shared/logger.ts";
setLogLevel(LogLevel.Debug);

// sent prompt to gpt and relay response
const response = await promptDalle(
    `A cartoon of an gnome in a pointed hat sanding in the woods.
    Bright cheery colors.`,
);

say("");
say("URL");
say(response.url);

await createPDF(response.url, response.revised_prompt);



async function createPDF(pngUrl, pngText){
    const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.create();

 
    const page = pdfDoc.addPage();
    page.drawText(pngText, {
    x: 100,
    y: 700,
    size: 12,
    maxWidth: page.getWidth() - 120,
    });

    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    const pngDims = pngImage.scale(0.5);

    page.drawImage(pngImage, {
        x: page.getWidth() / 2 - pngDims.width / 2 + 25,
        y: page.getHeight() / 2 - pngDims.height + 125,
        width: pngDims.width,
        height: pngDims.height,
    });



    const pdfBytes = await pdfDoc.save();
    await Deno.writeFile('create.pdf', pdfBytes);

  
    console.log('PDF file written to create.pdf'); 
        
    }

