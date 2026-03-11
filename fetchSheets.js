const https = require('https');
const fs = require('fs');

const url = 'https://docs.google.com/spreadsheets/d/1G3CjA5jLlIfZRYXbCYWPvGGUNlDLUxPd1WIw5XkGenY/export?format=csv&gid=0';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n');
    const categoriesMap = {};

    lines.forEach(line => {
      const cols = line.split(',');
      if(cols.length >= 3) {
        let category = cols[1]?.trim();
        let name = cols[2]?.trim();
        
        if(category && name && !category.includes('REF!') && category !== 'Category') {
            if(!categoriesMap[category]) {
                categoriesMap[category] = new Set();
            }
            categoriesMap[category].add(name);
        }
      }
    });

    const finalData = {};
    for(const cat in categoriesMap) {
        finalData[cat] = Array.from(categoriesMap[cat]);
    }

    fs.writeFileSync('./src/data/categories.json', JSON.stringify(finalData, null, 2));
    console.log('Categories saved to src/data/categories.json');
  });
}).on('error', err => console.error(err));
