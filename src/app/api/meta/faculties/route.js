export async function GET(request) {
  try {
    const url = 'https://docs.google.com/spreadsheets/d/1OEbjavae17P9XSsISZSlUH2svYlvlKXogYnecpr3Xr0/export?format=csv&gid=0';
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if(!response.ok) {
        throw new Error("Could not fetch the Google Sheet");
    }

    const textData = await response.text();
    
    const lines = textData.split('\n');
    let db = [];

    // Assuming we don't know the exact column format of the new sheet yet, 
    // we'll look for strings containing '@' and treat them as emails,
    // and the column next to them as the name. 
    lines.forEach(line => {
      const cols = line.split(',');
      let email = '';
      let name = '';

      for(let i=0; i<cols.length; i++) {
          const val = cols[i]?.trim();
          if(val.includes('@')) {
              email = val;
              // Attempt to guess the name from the previous or next column
              name = cols[i-1]?.trim() || cols[i+1]?.trim() || 'Unknown';
              break;
          }
      }

      if(email && email.length > 5 && !email.includes('REF!')) {
          db.push({ email, name });
      }
    });

    // Remove duplicates
    const uniqueDb = [];
    const seen = new Set();
    for(const item of db) {
        if(!seen.has(item.email)) {
             seen.add(item.email);
             uniqueDb.push(item);
        }
    }

    return Response.json({ success: true, data: uniqueDb });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
