const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

const ip = getLocalIP();
console.log('🌐 Your local IP address:', ip);
console.log('📱 Use this URL on your phone:', `http://${ip}:3000`);
console.log('');
console.log('📋 Steps:');
console.log('1. Make sure your phone is on the same WiFi');
console.log('2. Open browser on your phone');
console.log(`3. Go to: http://${ip}:3000`);
console.log('4. Test video chat between laptop and phone');