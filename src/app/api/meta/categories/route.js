import dbConnect from '@/lib/dbConnect';
import { CategoryData } from '@/models/CategoryData';

export async function GET(request) {
  try {
    const url = 'https://docs.google.com/spreadsheets/d/1G3CjA5jLlIfZRYXbCYWPvGGUNlDLUxPd1WIw5XkGenY/export?format=csv&gid=0';
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const textData = await response.text();
    
    const lines = textData.split('\n');
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
        finalData[cat] = Array.from(categoriesMap[cat]).sort();
    }

    return Response.json({ success: true, data: finalData });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
