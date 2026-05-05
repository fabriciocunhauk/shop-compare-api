import fs from 'fs';
import { extractTextFromImage } from './utils/extractTextFromImage.js';
import { parseExtractedText } from './utils/parseExtractedText.js';

async function run() {
  try {
    // Read the image file. Where is the image? I need the path.
    // The user uploaded images via chat. Can I access them? I don't have the path.
    console.log("Need image path");
  } catch (e) {
    console.error(e);
  }
}
run();
