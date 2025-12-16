const { execSync } = require('child_process');
const fs = require('fs');

const networks = [
  'mainnet',
  'sepolia',
  'polygon',
  'mumbai',
  'bsc',
  'bsctest',
  'avalanche',
  'fuji',
];

for (const network of networks) {
  try {
    console.log(`\n==============================\nDeploying to ${network}...\n==============================`);
    const result = execSync(`npx hardhat run scripts/deploy.js --network ${network}`, { encoding: 'utf-8' });
    console.log(result);
    // Try to read the deployment info file
    const infoPath = `deployments/deployment-info.json`;
    if (fs.existsSync(infoPath)) {
      const info = fs.readFileSync(infoPath, 'utf-8');
      fs.writeFileSync(`deployments/${network}-deployment-info.json`, info);
      console.log(`Saved: deployments/${network}-deployment-info.json`);
    }
  } catch (err) {
    console.error(`Deployment failed for ${network}:`, err.message);
  }
}
console.log('\nAll deployments attempted. Check deployments/ for results.'); 