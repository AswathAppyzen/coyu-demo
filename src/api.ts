import express from 'express';
import multer from 'multer';
// Import AWS SDK properly for ES modules
const AWS = await import('aws-sdk');
const { S3 } = AWS.default;
import csv from 'csv-parser';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createImageFromTemplate, processJsonDataAndGenerateImages } from './index.ts';
import { Parser } from 'json2csv';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5090;

// Configure Wasabi S3
const s3 = new S3({
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
  region: 'us-east-2',
  s3ForcePathStyle: true
});

const bucketName = 'studio-user-design';
const bucketPath = 'studio-assets/demo-test-files';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Root endpoint - redirect to the form
app.get('/', (req: express.Request, res: express.Response) => {
  res.redirect('/index.html');
});

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

function convertToCSVBase64(csvData: any[]) {
  // Convert JSON array to CSV
  const parser = new Parser();
  const csv = parser.parse(csvData);

  // Encode CSV to base64
  const csvBase64 = Buffer.from(csv, "utf-8").toString("base64");
  return csvBase64;
}

// Main endpoint for processing CSV and generating images
app.post('/process-csv', upload.single('csvFile'), async (req: express.Request, res: express.Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    console.log('📁 CSV file uploaded:', req.file.originalname);

    // Read and parse CSV
    const csvData = await parseCSV(req.file.path);

    if (!csvData || csvData.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    console.log(`📊 CSV has ${csvData.length} rows (including header)`);

    // Process CSV data and generate images

    console.log({first : csvData})
    const results = await processCSVAndGenerateImages(csvData);

    const uploadedLinks = await Promise.all(results.successful.map(async item => {
      return {
        imageLink: await uploadToWasabi(item.imageUrl, `image_${item.index}.png`, 'image/png'),
        index: item.index
      };
    }));

    console.log('📤 Uploaded image links:', uploadedLinks);

    // Create updated CSV with image links
    // const updatedCSVPath = await createUpdatedCSV(csvData, results, uploadedLinks);

    console.log({uploadedLinks})
    const updatedCsv = csvData.map((eachRow, index) => {
        // Data rows - add the corresponding uploaded image link
        const uploadedLink = uploadedLinks[index]?.imageLink?.url;
        console.log({rowIndex: index, uploadedLink});
        return {
          ...eachRow,
          generatedImageUrl: uploadedLink || 'No image generated'
        };

    })


 // todo

 console.log({updatedCsv})
    const csvBase64 = convertToCSVBase64(updatedCsv);


    // Upload updated CSV to Wasabi
    const csvUploadResult = await uploadToWasabi(csvBase64, `${Date.now()}-updated_output.csv`, 'text/csv');

    // Clean up temporary files
    // cleanupTempFiles([req.file.path, updatedCsvPath]);

    res.json({
      success: true,
      message: 'CSV processed successfully',
      results: {
        totalRows: csvData.length, // Exclude header
        successfulImages: results.successful.length,
        failedImages: results.failed.length,
        updatedCSVLink: csvUploadResult.url
      },
      csvDownloadLink: csvUploadResult.url,
      uploadedImageLinks: uploadedLinks.map(link => ({
        index: link.index,
        imageUrl: link.imageLink.url
      }))
    });

  } catch (error: any) {
    console.error('❌ Error processing CSV:', error);
    res.status(500).json({
      error: 'Failed to process CSV',
      details: error.message
    });
  }
});

// Function to parse CSV file
async function parseCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error: any) => reject(error));
  });
}

// Function to process CSV data and generate images
async function processCSVAndGenerateImages(csvData: any[]) {
  try {
    console.log('🚀 Starting batch image generation...');

    const template = {
      id: "Main Artboard",
      name: "Artboard-1",
      layers: [
        // {
        //   id: "Main Artboard",
        //   name: "Design 01",
        //   left: 0,
        //   top: 0,
        //   width: 1080,
        //   height: 1080,
        //   scaleX: 1,
        //   scaleY: 1,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: "#333",
        //   strokeWidth: 0.2,
        //   originX: "left",
        //   originY: "top",
        //   angle: 0,
        //   filters: null,
        //   locked: false,
        //   hasControls: true,
        //   editable: true,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: false,
        //   clipPath: null,
        //   fill: "#FCF6F1FF",
        //   metadata: {
        //     clipToFrame: true,
        //   },
        //   shadow: null,
        //   backgroundColor: "",
        //   type: "Artboard",
        //   preview: null,
        //   src: null,
        //   visible: true,
        //   eraser: null,
        // },
        // {
        //   id: "F8s-uOltbW152xCFrDdT3",
        //   name: "image_link",
        //   left: 275,
        //   top: 540,
        //   width: 2160,
        //   height: 2880,
        //   scaleX: 0.2361111111111111,
        //   scaleY: 0.3611111111111111,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: "#000000",
        //   strokeWidth: 0,
        //   originX: "center",
        //   originY: "center",
        //   angle: 0,
        //   filters: null,
        //   locked: false,
        //   hasControls: true,
        //   editable: true,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: false,
        //   clipPath: "Main Artboard",
        //   fill: null,
        //   metadata: {
        //     generationDate: 1756365706603,
        //     originalLayerPreview:
        //       "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372310735.jpeg",
        //     isSampleImg: false,
        //     frameId: "Main Artboard",
        //     stroke: "#000000",
        //     currentStrokeWidth: 0,
        //     currentRadius: 0,
        //   },
        //   shadow: null,
        //   backgroundColor: null,
        //   type: "StaticImage",
        //   preview:
        //     "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372310735.jpeg",
        //   src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372310735.jpeg",
        //   visible: true,
        //   eraser: null,
        //   cropX: 0,
        //   cropY: 0,
        // },
        // {
        //   id: "cdi91RvLZek7Z2YQ4KYme",
        //   name: "title",
        //   left: 805,
        //   top: 268.3351521296544,
        //   width: 470,
        //   height: 328.32,
        //   scaleX: 1,
        //   scaleY: 1,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: null,
        //   strokeWidth: 0,
        //   originX: "center",
        //   originY: "center",
        //   angle: 0,
        //   filters: null,
        //   locked: false,
        //   hasControls: true,
        //   editable: true,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: false,
        //   clipPath: "Main Artboard",
        //   fill: "#1A1A1AFF",
        //   metadata: {
        //     generationDate: 1756368735948,
        //     os: "Feel elegant in our midi dress with a flattering silhouette, flowing long skirt, and halter neckline, perfect for dressing up. Style this floral dress with strappy heels for a head-turning look, ideal for weddings and special occasions.",
        //     frameId: "Main Artboard",
        //   },
        //   shadow: null,
        //   backgroundColor: null,
        //   type: "StaticText",
        //   preview: null,
        //   src: null,
        //   visible: true,
        //   eraser: null,
        //   fontFamily: "Abel-Regular",
        //   fontSize: 36,
        //   fontURL:
        //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-e94d1410-d317-445b-af8c-ff51931d3867.ttf",
        //   text: "Feel elegant in our midi dress with a flattering silhouette, flowing long skirt, and halter neckline, perfect for dressing up. Style this floral dress with strappy heels for a head-turning look, ideal for weddings and special occasions.",
        //   textAlign: "center",
        //   textLines: null,
        //   underline: null,
        //   listBullet: null,
        //   listType: null,
        //   lineHeight: 1.16,
        //   charSpacing: 0,
        // },
        // {
        //   id: "ZYJ3gA8ICgRNyasr66QLv",
        //   name: "additional_image_link",
        //   left: 805,
        //   top: 745,
        //   width: 2160,
        //   height: 2880,
        //   scaleX: 0.2361111111111111,
        //   scaleY: 0.1701388888888889,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: null,
        //   strokeWidth: 0,
        //   originX: "center",
        //   originY: "center",
        //   angle: 0,
        //   filters: null,
        //   locked: false,
        //   hasControls: true,
        //   editable: true,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: false,
        //   clipPath: "radiusMask-ZYJ3gA8ICgRNyasr66QLv",
        //   fill: null,
        //   metadata: {
        //     generationDate: 1756365706603,
        //     originalLayerPreview:
        //       "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310735.jpeg",
        //     isSampleImg: false,
        //     frameId: "Main Artboard",
        //     stroke: "#000000",
        //     currentStrokeWidth: 0,
        //     currentRadius: 20,
        //   },
        //   shadow: null,
        //   backgroundColor: null,
        //   type: "StaticImage",
        //   preview:
        //     "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310735.jpeg",
        //   src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310735.jpeg",
        //   visible: true,
        //   eraser: null,
        //   cropX: 0,
        //   cropY: 0,
        // },
        // {
        //   id: "OjoEFE_LFZK0X_8pIttZn",
        //   name: "price",
        //   left: 908.27,
        //   top: 1028.23,
        //   width: 263.4688629646695,
        //   height: 36,
        //   scaleX: 1,
        //   scaleY: 1,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: "#000000FF",
        //   strokeWidth: 1.5,
        //   originX: "center",
        //   originY: "center",
        //   angle: 0,
        //   filters: null,
        //   locked: false,
        //   hasControls: true,
        //   editable: true,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: false,
        //   clipPath: "Main Artboard",
        //   fill: "#000000",
        //   metadata: {
        //     generationDate: 1756368735948,
        //     os: "12,999.00 INR",
        //     frameId: "Main Artboard",
        //   },
        //   shadow: null,
        //   backgroundColor: null,
        //   type: "StaticText",
        //   preview: null,
        //   src: null,
        //   visible: true,
        //   eraser: null,
        //   fontFamily: "Abel-Regular",
        //   fontSize: 36,
        //   fontURL:
        //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-e94d1410-d317-445b-af8c-ff51931d3867.ttf",
        //   text: "12,999.00 INR",
        //   textAlign: "right",
        //   textLines: null,
        //   underline: null,
        //   listBullet: null,
        //   listType: null,
        //   lineHeight: 1.16,
        //   charSpacing: 0,
        // },
        // {
        //   id: "VRU54p6LbqxKmxa8EZUba",
        //   name: "id",
        //   left: 983.9,
        //   top: 28,
        //   width: 151.826171875,
        //   height: 20,
        //   scaleX: 1,
        //   scaleY: 1,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: null,
        //   strokeWidth: 0,
        //   originX: "center",
        //   originY: "center",
        //   angle: 0,
        //   filters: null,
        //   locked: false,
        //   hasControls: true,
        //   editable: true,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: false,
        //   clipPath: "Main Artboard",
        //   fill: "#A1480BFF",
        //   metadata: {
        //     generationDate: 1756368735948,
        //     os: "KAREN MILLEN",
        //     frameId: "Main Artboard",
        //   },
        //   shadow: null,
        //   backgroundColor: null,
        //   type: "StaticText",
        //   preview: null,
        //   src: null,
        //   visible: true,
        //   eraser: null,
        //   fontFamily: "Abel-Regular",
        //   fontSize: 20,
        //   fontURL:
        //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-e94d1410-d317-445b-af8c-ff51931d3867.ttf",
        //   text: "KAREN MILLEN",
        //   textAlign: "right",
        //   textLines: null,
        //   underline: null,
        //   listBullet: null,
        //   listType: null,
        //   lineHeight: 0.9,
        //   charSpacing: 0,
        // },




// artboard 2
        // {
        //   id: "GfQYGnU67_oLmKweGV0x3",
        //   name: "Design 2",
        //   left: 1291.5564904225698,
        //   top: 14.473218303161545,
        //   width: 1080,
        //   height: 1080,
        //   scaleX: 1,
        //   scaleY: 1,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: "#333",
        //   strokeWidth: 0.2,
        //   originX: "left",
        //   originY: "top",
        //   angle: 0,
        //   filters: null,
        //   locked: null,
        //   hasControls: true,
        //   editable: null,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: null,
        //   clipPath: null,
        //   fill: "#FCF6F1FF",
        //   metadata: {
        //     clipToFrame: true,
        //   },
        //   shadow: null,
        //   backgroundColor: "",
        //   type: "Artboard",
        //   preview: null,
        //   src: null,
        //   visible: true,
        //   eraser: null,
        // },
        // {
        //   id: "R7McAWbZQybsfa8haessR",
        //   name: "Soul of the Archer Sagittarius Necklace",
        //   left: 1568.3937663309962,
        //   top: 770.8634124620008,
        //   width: 467,
        //   height: 69.12,
        //   scaleX: 1,
        //   scaleY: 1,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: null,
        //   strokeWidth: 0,
        //   originX: "center",
        //   originY: "center",
        //   angle: 0,
        //   filters: null,
        //   locked: null,
        //   hasControls: true,
        //   editable: true,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: null,
        //   clipPath: "GfQYGnU67_oLmKweGV0x3",
        //   fill: "#1A1A1AFF",
        //   metadata: {
        //     generationDate: 1756368735948,
        //     os: "Soul of the Archer Sagittarius Necklace",
        //     frameId: "GfQYGnU67_oLmKweGV0x3",
        //   },
        //   shadow: null,
        //   backgroundColor: null,
        //   type: "StaticText",
        //   preview: null,
        //   src: null,
        //   visible: true,
        //   eraser: null,
        //   fontFamily: "Akatab-Regular",
        //   fontSize: 32,
        //   fontURL:
        //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-5e2e5a6b-5b07-4220-ae18-9996d36c2279.ttf",
        //   text: "Soul of the Archer Sagittarius Necklace",
        //   textAlign: "left",
        //   textLines: null,
        //   underline: null,
        //   listBullet: null,
        //   listType: null,
        //   lineHeight: 1.16,
        //   charSpacing: 0,
        // },
        // {
        //   id: "_UVzsretSLIyZ1h3BGHbi",
        //   name: "media_public_.jpeg",
        //   left: 1567.3258011438834,
        //   top: 463.47454887666447,
        //   width: 2160,
        //   height: 2880,
        //   scaleX: 0.2166037359378585,
        //   scaleY: 0.1556016783850545,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: null,
        //   strokeWidth: 0,
        //   originX: "center",
        //   originY: "center",
        //   angle: 0,
        //   filters: null,
        //   locked: null,
        //   hasControls: true,
        //   editable: null,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: null,
        //   clipPath: "radiusMask-_UVzsretSLIyZ1h3BGHbi",
        //   fill: null,
        //   metadata: {
        //     generationDate: 1756365706603,
        //     originalLayerPreview:
        //       "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310129-copy-1756374794087.jpeg",
        //     isSampleImg: false,
        //     frameId: "GfQYGnU67_oLmKweGV0x3",
        //     stroke: "#000000",
        //     currentStrokeWidth: 0,
        //     currentRadius: 20,
        //   },
        //   shadow: null,
        //   backgroundColor: null,
        //   type: "StaticImage",
        //   preview:
        //     "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310129-copy-1756374794087.jpeg",
        //   src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310129-copy-1756374794087.jpeg",
        //   visible: true,
        //   eraser: null,
        //   cropX: 0,
        //   cropY: 0,
        // },
        // {
        //   id: "zr_m4ixdqV6on18mh6gi8",
        //   name: "Zariin",
        //   left: 1568.3937663309962,
        //   top: 86.70094809451048,
        //   width: 470,
        //   height: 36,
        //   scaleX: 1,
        //   scaleY: 1,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: null,
        //   strokeWidth: 0,
        //   originX: "center",
        //   originY: "center",
        //   angle: 0,
        //   filters: null,
        //   locked: null,
        //   hasControls: true,
        //   editable: true,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: null,
        //   clipPath: "GfQYGnU67_oLmKweGV0x3",
        //   fill: "#1A1A1AFF",
        //   metadata: {
        //     generationDate: 1756368735948,
        //     os: "Zariin",
        //     frameId: "GfQYGnU67_oLmKweGV0x3",
        //   },
        //   shadow: null,
        //   backgroundColor: null,
        //   type: "StaticText",
        //   preview: null,
        //   src: null,
        //   visible: true,
        //   eraser: null,
        //   fontFamily: "Abyssinica SIL-Regular",
        //   fontSize: 36,
        //   fontURL:
        //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-fb17e50d-9922-4d85-912d-a2bd3f269df6.ttf",
        //   text: "Zariin",
        //   textAlign: "left",
        //   textLines: null,
        //   underline: null,
        //   listBullet: null,
        //   listType: null,
        //   lineHeight: 1.16,
        //   charSpacing: 0,
        // },
        // {
        //   id: "7w-LTzn-lP4uFpJ9rCKWF",
        //   name: "1,299.00 INR",
        //   left: 1465.8787663309963,
        //   top: 1019.6876147611775,
        //   width: 263.47,
        //   height: 36,
        //   scaleX: 1,
        //   scaleY: 1,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: "#000000FF",
        //   strokeWidth: 1.5,
        //   originX: "center",
        //   originY: "center",
        //   angle: 0,
        //   filters: null,
        //   locked: null,
        //   hasControls: true,
        //   editable: true,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: null,
        //   clipPath: "GfQYGnU67_oLmKweGV0x3",
        //   fill: "#000000",
        //   metadata: {
        //     generationDate: 1756368735948,
        //     os: "1,299.00 INR",
        //     frameId: "GfQYGnU67_oLmKweGV0x3",
        //   },
        //   shadow: null,
        //   backgroundColor: null,
        //   type: "StaticText",
        //   preview: null,
        //   src: null,
        //   visible: true,
        //   eraser: null,
        //   fontFamily: "Akatab-Regular",
        //   fontSize: 36,
        //   fontURL:
        //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-5e2e5a6b-5b07-4220-ae18-9996d36c2279.ttf",
        //   text: "1,299.00 INR",
        //   textAlign: "left",
        //   textLines: null,
        //   underline: null,
        //   listBullet: null,
        //   listType: null,
        //   lineHeight: 1.16,
        //   charSpacing: 0,
        // },
        // {
        //   id: "bp5y6d4denXY6CNe3AQxj",
        //   name: "Line",
        //   left: 1333.3937663309962,
        //   top: 969.1109480945103,
        //   width: 432.1840323165625,
        //   height: 0,
        //   scaleX: 1,
        //   scaleY: 0.10380658169906383,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: "#B1B1B1FF",
        //   strokeWidth: 10,
        //   originX: "left",
        //   originY: "top",
        //   angle: 0,
        //   filters: null,
        //   locked: null,
        //   hasControls: true,
        //   editable: null,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: null,
        //   clipPath: "GfQYGnU67_oLmKweGV0x3",
        //   fill: "rgb(0,0,0)",
        //   metadata: {
        //     frameId: "GfQYGnU67_oLmKweGV0x3",
        //   },
        //   shadow: null,
        //   backgroundColor: "",
        //   type: "line",
        //   preview: null,
        //   src: null,
        //   visible: true,
        //   eraser: null,
        //   x1: -216.09201615828124,
        //   x2: 216.09201615828124,
        //   y1: 0,
        //   y2: 0,
        // },
        // {
        //   id: "eeVNGHYyVidKQHDCVh-y8",
        //   name: "media_public_.jpeg",
        //   left: 2101.756490422572,
        //   top: 554.4732183031615,
        //   width: 2160,
        //   height: 2880,
        //   scaleX: 0.25,
        //   scaleY: 0.375,
        //   opacity: 1,
        //   flipX: false,
        //   flipY: false,
        //   skewX: 0,
        //   skewY: 0,
        //   stroke: "#000000",
        //   strokeWidth: 0,
        //   originX: "center",
        //   originY: "center",
        //   angle: 0,
        //   filters: null,
        //   locked: false,
        //   hasControls: true,
        //   editable: null,
        //   lockMovementX: false,
        //   lockMovementY: false,
        //   lockRotation: false,
        //   lockScalingX: false,
        //   lockScalingY: false,
        //   lockUniScaling: null,
        //   clipPath: "GfQYGnU67_oLmKweGV0x3",
        //   fill: null,
        //   metadata: {
        //     generationDate: 1756365706603,
        //     originalLayerPreview:
        //       "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374794087.jpeg",
        //     isSampleImg: false,
        //     frameId: "GfQYGnU67_oLmKweGV0x3",
        //     stroke: "#000000",
        //     currentStrokeWidth: 0,
        //     currentRadius: 0,
        //   },
        //   shadow: null,
        //   backgroundColor: null,
        //   type: "StaticImage",
        //   preview:
        //     "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374794087.jpeg",
        //   src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374794087.jpeg",
        //   visible: true,
        //   eraser: null,
        //   cropX: 0,
        //   cropY: 0,
        // },

        // Artboard 3 layers starts from here.
        {
          id: "NhdUtho_3ZcrNNB0R_w-V",
          name: "Design 3",
          left: 2605.089822593395,
          top: 35.173893260740854,
          width: 1080,
          height: 1080,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          flipX: false,
          flipY: false,
          skewX: 0,
          skewY: 0,
          stroke: "#333",
          strokeWidth: 0.2,
          originX: "left",
          originY: "top",
          angle: 0,
          filters: null,
          locked: null,
          hasControls: true,
          editable: null,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockUniScaling: null,
          clipPath: null,
          fill: "#FCFCF2FF",
          metadata: {
            clipToFrame: true,
          },
          shadow: null,
          backgroundColor: "",
          type: "Artboard",
          preview: null,
          src: null,
          visible: true,
          eraser: null,
        },
        {
          id: "6v7qjxC8RdlIDQhT8eFvp",
          name: "title",
          left: 3145.1898225933955,
          top: 121.87430546325224,
          width: 553.2703971119136,
          height: 32,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          flipX: false,
          flipY: false,
          skewX: 0,
          skewY: 0,
          stroke: null,
          strokeWidth: 0,
          originX: "center",
          originY: "center",
          angle: 0,
          filters: null,
          locked: null,
          hasControls: true,
          editable: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockUniScaling: null,
          clipPath: "NhdUtho_3ZcrNNB0R_w-V",
          fill: "#44463BFF",
          metadata: {
            generationDate: 1756368735948,
            os: "Washed Indigo Lacework Co-Ord Set",
            frameId: "NhdUtho_3ZcrNNB0R_w-V",
          },
          shadow: null,
          backgroundColor: null,
          type: "StaticText",
          preview: null,
          src: null,
          visible: true,
          eraser: null,
          fontFamily: "Alata-Regular",
          fontSize: 32,
          fontURL:
            "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-330c240b-aade-4b3e-a9a2-eae241ad18cc.ttf",
          text: "Washed Indigo Lacework Co-Ord Set",
          textAlign: "center",
          textLines: null,
          underline: null,
          listBullet: null,
          listType: null,
          lineHeight: 1.1400000000000001,
          charSpacing: 0,
        },
        {
          id: "DDEpjSYW2ENLSBY5vQVGR",
          name: "brand",
          left: 2891.8812290463275,
          top: 1036.117181877075,
          width: 470,
          height: 36,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          flipX: false,
          flipY: false,
          skewX: 0,
          skewY: 0,
          stroke: null,
          strokeWidth: 0,
          originX: "center",
          originY: "center",
          angle: 0,
          filters: null,
          locked: null,
          hasControls: true,
          editable: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockUniScaling: null,
          clipPath: "NhdUtho_3ZcrNNB0R_w-V",
          fill: "#1A1A1AFF",
          metadata: {
            generationDate: 1756368735948,
            os: "Zariin",
            frameId: "NhdUtho_3ZcrNNB0R_w-V",
          },
          shadow: null,
          backgroundColor: null,
          type: "StaticText",
          preview: null,
          src: null,
          visible: true,
          eraser: null,
          fontFamily: "Abyssinica SIL-Regular",
          fontSize: 36,
          fontURL:
            "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-fb17e50d-9922-4d85-912d-a2bd3f269df6.ttf",
          text: "Zariin",
          textAlign: "left",
          textLines: null,
          underline: null,
          listBullet: null,
          listType: null,
          lineHeight: 1.16,
          charSpacing: 0,
        },
        {
          id: "H2n44I6IymYwsL_DaFNll",
          name: "price",
          left: 3473.137739227566,
          top: 1039.3671818770752,
          width: 354.8671875,
          height: 48,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          flipX: false,
          flipY: false,
          skewX: 0,
          skewY: 0,
          stroke: "#000000FF",
          strokeWidth: 1.5,
          originX: "center",
          originY: "center",
          angle: 0,
          filters: null,
          locked: null,
          hasControls: true,
          editable: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockUniScaling: null,
          clipPath: "NhdUtho_3ZcrNNB0R_w-V",
          fill: "#000000",
          metadata: {
            generationDate: 1756368735948,
            os: "1,299.00 INR",
            frameId: "NhdUtho_3ZcrNNB0R_w-V",
          },
          shadow: null,
          backgroundColor: null,
          type: "StaticText",
          preview: null,
          src: null,
          visible: true,
          eraser: null,
          fontFamily: "Akatab-Regular",
          fontSize: 48,
          fontURL:
            "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-5e2e5a6b-5b07-4220-ae18-9996d36c2279.ttf",
          text: "1,299.00 INR",
          textAlign: "right",
          textLines: null,
          underline: null,
          listBullet: null,
          listType: null,
          lineHeight: 1.22,
          charSpacing: 0,
        },
        {
          id: "xBBEYJXId3BJuzOKTZxBp",
          name: "image_link",
          left: 2875.089822593395,
          top: 574.1724712385835,
          width: 2160,
          height: 2880,
          scaleX: 0.25,
          scaleY: 0.27,
          opacity: 1,
          flipX: false,
          flipY: false,
          skewX: 0,
          skewY: 0,
          stroke: null,
          strokeWidth: 0,
          originX: "center",
          originY: "center",
          angle: 0,
          filters: null,
          locked: false,
          hasControls: true,
          editable: null,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockUniScaling: null,
          clipPath: "NhdUtho_3ZcrNNB0R_w-V",
          fill: null,
          metadata: {
            generationDate: 1756365706603,
            originalLayerPreview:
              "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756374965094-copy-1756376490087.jpeg",
            isSampleImg: false,
            frameId: "NhdUtho_3ZcrNNB0R_w-V",
            stroke: "#000000",
            currentStrokeWidth: 0,
            currentRadius: 0,
          },
          shadow: null,
          backgroundColor: null,
          type: "StaticImage",
          preview:
            "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756374965094-copy-1756376490087.jpeg",
          src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756374965094-copy-1756376490087.jpeg",
          visible: true,
          eraser: null,
          cropX: 0,
          cropY: 0,
        },
        {
          id: "LKnoQenTKbaMOKOpsRLQX",
          name: "additional_image_link",
          left: 3415.2898225933964,
          top: 575.7349563854231,
          width: 2160,
          height: 2880,
          scaleX: 0.25,
          scaleY: 0.2708333333333333,
          opacity: 1,
          flipX: false,
          flipY: false,
          skewX: 0,
          skewY: 0,
          stroke: "#000000",
          strokeWidth: 0,
          originX: "center",
          originY: "center",
          angle: 0,
          filters: [
            // {
            //   type: "Sepia",
            // },
          ],
          locked: false,
          hasControls: true,
          editable: null,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockUniScaling: null,
          clipPath: "NhdUtho_3ZcrNNB0R_w-V",
          fill: null,
          metadata: {
            generationDate: 1756365706603,
            originalLayerPreview:
              "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756376490088.jpeg",
            isSampleImg: false,
            frameId: "NhdUtho_3ZcrNNB0R_w-V",
            stroke: "#000000",
            currentStrokeWidth: 0,
            currentRadius: 0,
            activeFilter: "Sepia",
          },
          shadow: null,
          backgroundColor: null,
          type: "StaticImage",
          preview:
            "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756376490088.jpeg",
          src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756376490088.jpeg",
          visible: true,
          eraser: null,
          cropX: 0,
          cropY: 0,
        },
      ],
      frame: {
        width: 1080,
        height: 1080,
      },
      metadata: {
        animated: false,
      },
    };

    // Use the processJsonDataAndGenerateImages function from index.ts
    console.log('🚀 Starting batch image generation using index.ts function...');

    try {
            // Convert CSV data to the format expected by processJsonDataAndGenerateImages
      // The function expects: [headerRow, dataRow1, dataRow2, ...] where headerRow is an array of column names
      const headerRow = Object.keys(csvData[0] || {});
      // const dataRows = csvData.slice(1).map(row => headerRow.map(key => row[key]));
      const dataRows = csvData.map(row => headerRow.map(key => row[key]));
      const formattedData = [headerRow, ...dataRows];

      console.log({formattedData})
      console.log('📊 Formatted data structure:', {
        headerRow,
        dataRowsCount: dataRows.length,
        sampleDataRow: dataRows[0],
        totalRows: formattedData.length
      });

      const results = await processJsonDataAndGenerateImages(formattedData, template);

              // Convert the results to the expected format for CSV generation
        const processedResults = {
          successful: results.successful.map((item: any, index: number) => ({
            index: index + 1,
            imageUrl: item.value?.base64Data ? `data:image/png;base64,${item.value.base64Data}` : 'No image generated',
            row: csvData[index + 1] || {}
          })),
          failed: results.failed.map((item: any, index: number) => ({
            index: index + 1,
            error: item.value?.error || item.reason?.message || 'Unknown error',
            row: csvData[index + 1] || {}
          }))
        };

      return processedResults;
    } catch (error: any) {
      console.error('❌ Error in batch processing:', error);
      throw error;
    }

  } catch (error: any) {
    console.error('Error in batch processing:', error);
    throw error;
  }
}

// Function to create updated CSV with image links
async function createUpdatedCSV(originalData: any[], results: any, uploadedLinks: any[]) {
  const csvFilePath = path.join(__dirname, `../temp_updated_${Date.now()}.csv`);

  // Create CSV writer with proper header format
  const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
      ...Object.keys(originalData[0] || {}).map(key => ({ id: key, title: key })),
      { id: 'generated_image_url', title: 'Generated Image URL' },
      { id: 'uploaded_image_link', title: 'Uploaded Image Link' }
    ]
  });

  // Prepare data with image URLs and uploaded links
  const updatedData = originalData.map((row, index) => {
    if (index === 0) {
      // Header row
      return {
        ...row,
        generated_image_url: 'Generated Image URL',
        uploaded_image_link: 'Uploaded Image Link'
      };
    } else {
      // Data row
      const result = results.successful.find((r: any) => r.index === index);
      const uploadedLink = uploadedLinks.find((link: any) => link.index === index);

      return {
        ...row,
        generated_image_url: result ? result.imageUrl : 'Failed to generate',
        uploaded_image_link: uploadedLink ? uploadedLink.imageLink.url : 'Not uploaded'
      };
    }
  });

  // Write CSV
  await csvWriter.writeRecords(updatedData);

  return csvFilePath;
}

// Function to create new CSV with uploaded image links
async function createNewCsv(originalData: any[], uploadedLinks: any[]) {
  const csvFilePath = path.join(__dirname, `../temp_new_csv_${Date.now()}.csv`);

  // Create CSV writer with proper header format
  const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
      ...Object.keys(originalData[0] || {}).map(key => ({ id: key, title: key })),
      { id: 'uploaded_image_link', title: 'Uploaded Image Link' }
    ]
  });

  // Prepare data with uploaded links
  const updatedData = originalData.map((row, index) => {
    if (index === 0) {
      // Header row
      return {
        ...row,
        uploaded_image_link: 'Uploaded Image Link'
      };
    } else {
      // Data row - find the uploaded link for this row
      const uploadedLink = uploadedLinks.find((link: any) => link.index === index);

      return {
        ...row,
        uploaded_image_link: uploadedLink ? uploadedLink.imageLink.url : 'Not uploaded'
      };
    }
  });

  // Write CSV
  await csvWriter.writeRecords(updatedData);

  return csvFilePath;
}

// Function to upload file to Wasabi
async function uploadToWasabi(fileContent: Buffer | string, fileName: string, contentType: string) {

  // Convert base64 string to Buffer if needed
  let body: Buffer;
  if (typeof fileContent === 'string' && fileContent.startsWith('data:image/')) {
    // Extract base64 data from data URL
    const base64Data = fileContent.replace(/^data:image\/[^;]+;base64,/, '');
    body = Buffer.from(base64Data, 'base64');
  } else if (typeof fileContent === 'string') {
    // Assume it's already base64 without data URL prefix
    body = Buffer.from(fileContent, 'base64');
  } else {
    // It's already a Buffer
    body = fileContent;
  }

  const key = `${bucketPath}/${fileName}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read'
  };

  try {
    console.log('🚀 Uploading file to Wasabi...');
    const result = await s3.upload(params).promise();
    console.log(`✅ File uploaded successfully: ${result.Location}`);

    return {
      url: result.Location,
      key: key,
      bucket: bucketName
    };
  } catch (error: any) {
    console.error('❌ Error uploading to Wasabi:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Function to cleanup temporary files
function cleanupTempFiles(filePaths: string[]) {
  filePaths.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Cleaned up: ${filePath}`);
      }
    } catch (error: any) {
      console.warn(`⚠️ Could not cleanup file ${filePath}:`, error.message);
    }
  });
}

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 API server running on port ${port}`);
  console.log(`📝 Health check: http://localhost:${port}/health`);
  console.log(`🔄 Process CSV: POST http://localhost:${port}/process-csv`);
  console.log(`🌐 Web interface: http://localhost:${port}`);
});

export default app;
