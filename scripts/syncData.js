import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';

dotenv.config();

const syncData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
        
        console.log('Starting sync process...');
        
        // Fetch total count
        const countResponse = await fetch('https://iamalone.adminisalone.workers.dev/');
        const countText = await countResponse.text();
        const totalCount = parseInt(countText.trim());
        
        console.log(`Total companies to sync: ${totalCount}`);
        
        let synced = 0;
        let updated = 0;
        let created = 0;
        let errors = 0;
        
        // Fetch and store each company
        for (let i = 1; i <= totalCount; i++) {
            try {
                const response = await fetch(`https://iamalone.adminisalone.workers.dev/isadminalone/${i}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const companyData = await response.json();
                
                // Check if company already exists
                const existingCompany = await Company.findOne({ id: i });
                
                if (existingCompany) {
                    // Update only if data has changed
                    const isDataChanged = JSON.stringify(existingCompany.toObject()) !== JSON.stringify({ ...companyData, id: i, _id: existingCompany._id });
                    
                    if (isDataChanged) {
                        await Company.findOneAndUpdate(
                            { id: i },
                            { ...companyData, id: i },
                            { new: true }
                        );
                        updated++;
                    }
                } else {
                    // Create new company
                    await Company.create({ ...companyData, id: i });
                    created++;
                }
                
                synced++;
                if (synced % 50 === 0) {
                    console.log(`Progress: ${synced}/${totalCount} | Created: ${created} | Updated: ${updated} | Errors: ${errors}`);
                }
            } catch (err) {
                errors++;
                console.error(`Error syncing company ${i}:`, err.message);
            }
        }
        
        console.log('\n=== Sync Complete ===');
        console.log(`Total processed: ${synced}`);
        console.log(`Created: ${created}`);
        console.log(`Updated: ${updated}`);
        console.log(`Errors: ${errors}`);
        console.log(`Database total: ${await Company.countDocuments()}`);
        
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Sync error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

syncData();
