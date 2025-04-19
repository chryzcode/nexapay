# NexaPay Dashboard Preview Generator

This folder contains HTML templates and a script to generate dashboard preview images for the NexaPay application.

## Available Files
- `dashboard-preview.html`: Desktop dashboard design (650x420px)  
- `dashboard-mobile-preview.html`: Mobile dashboard design (350x500px)
- `generate-previews.js`: Script to convert HTML to PNG images

## Option 1: Manual Screenshot
The simplest method is to:
1. Open either HTML file in a browser
2. Take a screenshot (press PrtScn key or use browser developer tools)
3. Save as `dashboard-preview.png` or `dashboard-mobile-preview.png` in the public folder

## Option 2: Using the Generator Script
For automated image generation:

1. Install Node.js if you don't have it already
2. Open a terminal/command prompt in this directory
3. Run:
   ```
   npm install
   npm run generate
   ```
4. The script will create:
   - `/public/dashboard-preview.png`
   - `/public/dashboard-mobile-preview.png`

## Note
- Make sure these image files are in the `/public` folder for your Next.js app to use them
- The images should match the dimensions specified in your `page.tsx` file 