# CSV Image Generator API

This API takes a CSV file as input, processes each row to generate images using a template, uploads the generated images to Wasabi cloud storage, and returns an updated CSV with image links.

## Features

- 📁 CSV file upload and processing
- 🎨 Image generation using Fabric.js canvas templates
- ☁️ Automatic upload to Wasabi cloud storage
- 📊 Updated CSV with image URLs
- 🌐 Web interface for easy testing
- 🔄 Batch processing of multiple rows

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Wasabi cloud storage account

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coyu-demo
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variables (optional, defaults are provided):
```bash
export WASABI_ACCESS_KEY="your_access_key"
export WASABI_SECRET_KEY="your_secret_key"
export PORT=3000
```

## Configuration

The API is configured to use Wasabi cloud storage with the following settings:
- **Bucket**: `studio-user-design`
- **Path**: `studio-assets/demo-test-files`
- **Region**: `us-east-2`
- **Endpoint**: `https://s3.us-east-2.wasabisys.com`

You can modify these settings in `src/api.ts`.

## Usage

### Starting the API

```bash
# Development mode
npm run api

# Build and start production
npm run build
npm start
```

The API will start on `http://localhost:3000` (or the port specified in `PORT` environment variable).

### API Endpoints

#### 1. Health Check
```
GET /health
```
Returns API status and timestamp.

#### 2. Process CSV
```
POST /process-csv
Content-Type: multipart/form-data
```
Upload a CSV file to process and generate images.

**Form Data:**
- `csvFile`: CSV file (required)

**Response:**
```json
{
  "success": true,
  "message": "CSV processed successfully",
  "results": {
    "totalRows": 3,
    "successfulImages": 3,
    "failedImages": 0,
    "updatedCSVLink": "https://..."
  },
  "csvDownloadLink": "https://..."
}
```

### Web Interface

Visit `http://localhost:3000` to access the web interface for:
- Uploading CSV files
- Monitoring processing progress
- Downloading updated CSV files

## CSV Format

Your CSV should have headers that match the template layer names. For example:

```csv
title,description,price
"Product Name","Product description",29.99
```

The API will:
1. Read the CSV headers
2. Match column names with template layer names
3. Update the template with data from each row
4. Generate an image for each row
5. Upload images to Wasabi
6. Create an updated CSV with image URLs

## Template Configuration

The template is defined in the `processCSVAndGenerateImages` function in `src/api.ts`. You can modify:

- **Artboard dimensions**: `frame.width` and `frame.height`
- **Layer properties**: position, size, colors, fonts, etc.
- **Text layers**: Update text content from CSV data
- **Image layers**: Update image sources from CSV data

## Customization

### Adding New Layer Types

1. Define the layer in the template
2. Add logic in the CSV processing loop to handle the new layer type
3. Update the template with CSV data as needed

### Modifying Image Generation

The image generation uses the existing `createImageFromTemplate` function from `src/index.ts`. You can:

- Modify the template structure
- Add new visual elements
- Change colors, fonts, and layouts
- Add filters and effects

### Changing Cloud Storage

To use a different cloud storage provider:

1. Update the AWS SDK configuration in `src/api.ts`
2. Modify the `uploadToWasabi` function
3. Update bucket names and paths

## Error Handling

The API includes comprehensive error handling:

- **File validation**: Only CSV files are accepted
- **Processing errors**: Individual row failures don't stop the entire process
- **Upload errors**: Failed uploads are logged and reported
- **Cleanup**: Temporary files are automatically removed

## File Structure

```
├── src/
│   ├── api.ts          # Main API server
│   └── index.ts        # Image generation logic
├── public/
│   └── index.html      # Web interface
├── uploads/            # Temporary file storage
├── package.json        # Dependencies
└── README.md          # This file
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the `PORT` environment variable
2. **Wasabi upload failures**: Check your access keys and bucket permissions
3. **Image generation errors**: Verify the template configuration
4. **Memory issues**: Process smaller CSV files or add memory limits

### Debug Mode

Enable debug logging by setting:
```bash
export DEBUG=*
```

### Logs

The API provides detailed console logging for:
- File uploads
- CSV processing
- Image generation
- Cloud uploads
- Error details

## Performance

- **Small files** (< 100 rows): Processed in seconds
- **Medium files** (100-1000 rows): Processed in minutes
- **Large files** (> 1000 rows): Consider batch processing or queue systems

## Security

- File type validation (CSV only)
- Temporary file cleanup
- No persistent file storage
- Environment variable configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the error logs
3. Open an issue on GitHub
4. Contact the development team

---

**Note**: This API is designed for development and testing purposes. For production use, consider adding authentication, rate limiting, and additional security measures.
