import { createWorker, createScheduler, PSM } from 'tesseract.js';

const scheduler = createScheduler();
let initPromise = null;

async function initScheduler() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Create a persistent worker using the local eng.traineddata cache
    const worker = await createWorker('eng', 1, {
      cachePath: '.',
      gzip: false
    });
    
    // We let Tesseract use its default PSM (AUTO), because SINGLE_COLUMN was completely missing the prices on the right side of the receipt.
    // await worker.setParameters({
    //   tessedit_pageseg_mode: PSM.AUTO,
    // });
    
    scheduler.addWorker(worker);
  })();

  return initPromise;
}

export async function extractTextFromImage(image) {
  // Ensure the scheduler is initialized once
  await initScheduler();

  // Use the scheduler to handle concurrent requests
  const { data: { text } } = await scheduler.addJob('recognize', image); 
  
  return text.trim();
}