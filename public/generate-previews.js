const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Generating dashboard preview images...');
  
  const browser = await puppeteer.launch();
  
  // Generate desktop dashboard preview
  const desktopPage = await browser.newPage();
  const desktopHtmlPath = path.join(__dirname, 'dashboard-preview.html');
  
  await desktopPage.goto(`file://${desktopHtmlPath}`);
  await desktopPage.setViewport({
    width: 680,
    height: 450,
    deviceScaleFactor: 2, // Higher resolution for better quality
  });
  
  await desktopPage.screenshot({
    path: path.join(__dirname, 'dashboard-preview.png'),
    omitBackground: true,
  });
  
  console.log('Desktop dashboard preview generated!');
  
  // Generate mobile dashboard preview
  const mobilePage = await browser.newPage();
  const mobileHtmlPath = path.join(__dirname, 'dashboard-mobile-preview.html');
  
  await mobilePage.goto(`file://${mobileHtmlPath}`);
  await mobilePage.setViewport({
    width: 370,
    height: 520,
    deviceScaleFactor: 2, // Higher resolution for better quality
  });
  
  await mobilePage.screenshot({
    path: path.join(__dirname, 'dashboard-mobile-preview.png'),
    omitBackground: true,
  });
  
  console.log('Mobile dashboard preview generated!');
  
  await browser.close();
  console.log('Done!');
})(); 