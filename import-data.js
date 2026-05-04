const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jwdsrtdajlacwcmwydyq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TuAJZ5GDWz8AVb5vbUkCpQ_VSIQNas8';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Date converter: DD/MM/YYYY → YYYY-MM-DD
function convertDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return null;
}

async function importVisits() {
  try {
    console.log('Starting visit import...\n');

    // Read visits CSV
    const visits = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream('./MASTER_VISITS_TABLE_4.csv')
        .pipe(csv())
        .on('data', (row) => {
          visits.push({
            pet_number: parseInt(row['Pet Number']),
            visit_number: parseInt(row['Visit Number']),
            visit_date: convertDate(row['Visit Date']),
            treatment_notes: row['Treatment Notes'] || null,
            payment_amount: row['Payment Amount'] ? parseFloat(row['Payment Amount'].replace('£', '').replace(',', '')) : null,
            payment_method: row['Payment Method'] || null,
            signature_of_consent: row['Signature of Consent'] === 'PROVIDED'
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Loaded ${visits.length} visits from CSV\n`);

    // Get all dogs to map pet_number -> dog_id
    const { data: dogsData, error: dogsError } = await supabase.from('dogs').select('id, pet_number');
    if (dogsError) {
      console.error('Error fetching dogs:', dogsError);
      return;
    }

    const dogMap = new Map();
    dogsData.forEach(dog => dogMap.set(dog.pet_number, dog.id));
    console.log(`Found ${dogMap.size} dogs in database\n`);

    // Insert visits
    let visitCount = 0;
    let skipCount = 0;

    for (const visit of visits) {
      const dogId = dogMap.get(visit.pet_number);
      if (!dogId) {
        console.warn(`⚠ Visit for unknown dog (Pet #${visit.pet_number}) - skipping`);
        skipCount++;
        continue;
      }

      const { error: visitError } = await supabase
        .from('visits')
        .insert([{
          dog_id: dogId,
          visit_number: visit.visit_number,
          visit_date: visit.visit_date,
          treatment_notes: visit.treatment_notes,
          payment_amount: visit.payment_amount,
          payment_method: visit.payment_method,
          signature_of_consent: visit.signature_of_consent,
          date_of_signature: visit.visit_date
        }]);

      if (visitError) {
        console.error(`Error creating visit for dog #${visit.pet_number} (${visit.visit_date}):`, visitError.message);
        skipCount++;
        continue;
      }
      visitCount++;
      if (visitCount % 20 === 0) console.log(`✓ ${visitCount} visits created...`);
    }

    console.log(`\n✅ Import complete!`);
    console.log(`Visits created: ${visitCount}`);
    console.log(`Visits skipped: ${skipCount}`);
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

importVisits();