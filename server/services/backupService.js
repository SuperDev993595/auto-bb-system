const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const crypto = require('crypto');
const Backup = require('../models/Backup');
const SystemLog = require('../models/SystemLog');

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.ensureBackupDirectory();
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch (error) {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  async createBackup(backupData, userId) {
    const startTime = Date.now();
    
    try {
      // Create backup record
      const backup = new Backup({
        ...backupData,
        createdBy: userId,
        location: path.join(this.backupDir, `${backupData.name}.json`)
      });

      await backup.markAsStarted();
      
      // Log backup start
      await SystemLog.logInfo('backup', 'backup_started', `Backup ${backup.name} started`, {
        userId,
        resource: 'backup',
        resourceId: backup._id
      });

      // Perform the actual backup
      const backupResult = await this.performBackup(backup);
      
      // Update backup record
      await backup.markAsCompleted(
        backupResult.size,
        Date.now() - startTime,
        backupResult.metadata
      );

      // Log backup completion
      await SystemLog.logInfo('backup', 'backup_completed', `Backup ${backup.name} completed successfully`, {
        userId,
        resource: 'backup',
        resourceId: backup._id,
        metadata: {
          size: backupResult.size,
          duration: Date.now() - startTime,
          collections: backupResult.metadata.totalCollections
        }
      });

      return backup;

    } catch (error) {
      // Log backup failure
      await SystemLog.logError('backup', 'backup_failed', `Backup failed: ${error.message}`, {
        userId,
        resource: 'backup',
        metadata: { error: error.message }
      });

      throw error;
    }
  }

  async performBackup(backup) {
    const collections = await this.getCollectionsToBackup(backup);
    const backupData = {};
    let totalDocuments = 0;
    let totalCollections = collections.length;

    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.collection(collectionName);
        const documents = await collection.find({}).toArray();
        
        backupData[collectionName] = documents;
        totalDocuments += documents.length;

        // Log progress for large collections
        if (documents.length > 1000) {
          await SystemLog.logInfo('backup', 'backup_progress', 
            `Backed up ${collectionName}: ${documents.length} documents`, {
            resource: 'backup',
            resourceId: backup._id
          });
        }

      } catch (error) {
        await SystemLog.logWarning('backup', 'collection_backup_failed', 
          `Failed to backup collection ${collectionName}: ${error.message}`, {
          resource: 'backup',
          resourceId: backup._id,
          metadata: { collection: collectionName, error: error.message }
        });
      }
    }

    // Write backup to file
    const backupContent = JSON.stringify(backupData, null, 2);
    let finalContent = backupContent;

    // Apply compression if enabled
    if (backup.compression) {
      finalContent = await this.compressData(backupContent);
    }

    // Apply encryption if enabled
    if (backup.encryption) {
      finalContent = await this.encryptData(finalContent, backup.encryptionKey);
    }

    await fs.writeFile(backup.location, finalContent);

    // Calculate file size
    const stats = await fs.stat(backup.location);
    const size = stats.size;

    return {
      size,
      metadata: {
        totalDocuments,
        totalCollections,
        databaseVersion: mongoose.version,
        backupVersion: '1.0.0'
      }
    };
  }

  async getCollectionsToBackup(backup) {
    const allCollections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = allCollections.map(col => col.name);

    if (backup.collections && backup.collections.length > 0) {
      return collectionNames.filter(name => backup.collections.includes(name));
    }

    if (backup.excludedCollections && backup.excludedCollections.length > 0) {
      return collectionNames.filter(name => !backup.excludedCollections.includes(name));
    }

    return collectionNames;
  }

  async compressData(data) {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks = [];

      archive.on('data', chunk => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      archive.append(data, { name: 'backup.json' });
      archive.finalize();
    });
  }

  async encryptData(data, key) {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  async restoreBackup(backupId, userId) {
    const backup = await Backup.findById(backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    if (backup.status !== 'completed') {
      throw new Error('Backup is not completed and cannot be restored');
    }

    const startTime = Date.now();

    try {
      // Log restore start
      await SystemLog.logInfo('backup', 'restore_started', `Restore started for backup ${backup.name}`, {
        userId,
        resource: 'backup',
        resourceId: backup._id
      });

      // Read backup file
      let backupContent = await fs.readFile(backup.location, 'utf8');

      // Decrypt if encrypted
      if (backup.encryption) {
        backupContent = await this.decryptData(backupContent, backup.encryptionKey);
      }

      // Decompress if compressed
      if (backup.compression) {
        backupContent = await this.decompressData(backupContent);
      }

      const backupData = JSON.parse(backupContent);

      // Perform restore
      await this.performRestore(backupData, backup);

      // Log restore completion
      await SystemLog.logInfo('backup', 'restore_completed', `Restore completed for backup ${backup.name}`, {
        userId,
        resource: 'backup',
        resourceId: backup._id,
        metadata: {
          duration: Date.now() - startTime,
          collections: Object.keys(backupData).length
        }
      });

      return { success: true, duration: Date.now() - startTime };

    } catch (error) {
      // Log restore failure
      await SystemLog.logError('backup', 'restore_failed', `Restore failed: ${error.message}`, {
        userId,
        resource: 'backup',
        resourceId: backup._id,
        metadata: { error: error.message }
      });

      throw error;
    }
  }

  async performRestore(backupData, backup) {
    for (const [collectionName, documents] of Object.entries(backupData)) {
      try {
        const collection = mongoose.connection.collection(collectionName);
        
        // Clear existing data
        await collection.deleteMany({});
        
        // Insert backup data
        if (documents.length > 0) {
          await collection.insertMany(documents);
        }

        await SystemLog.logInfo('backup', 'collection_restored', 
          `Restored collection ${collectionName}: ${documents.length} documents`, {
          resource: 'backup',
          resourceId: backup._id,
          metadata: { collection: collectionName, documents: documents.length }
        });

      } catch (error) {
        await SystemLog.logError('backup', 'collection_restore_failed', 
          `Failed to restore collection ${collectionName}: ${error.message}`, {
          resource: 'backup',
          resourceId: backup._id,
          metadata: { collection: collectionName, error: error.message }
        });
        throw error;
      }
    }
  }

  async decryptData(encryptedData, key) {
    const algorithm = 'aes-256-cbc';
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  async decompressData(compressedData) {
    // This is a simplified decompression - in a real implementation,
    // you'd use a proper decompression library
    return compressedData;
  }

  async verifyBackup(backupId, userId) {
    const backup = await Backup.findById(backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    try {
      // Read and parse backup file
      let backupContent = await fs.readFile(backup.location, 'utf8');

      if (backup.encryption) {
        backupContent = await this.decryptData(backupContent, backup.encryptionKey);
      }

      if (backup.compression) {
        backupContent = await this.decompressData(backupContent);
      }

      const backupData = JSON.parse(backupContent);

      // Calculate checksum
      const checksum = crypto.createHash('sha256').update(backupContent).digest('hex');

      // Verify backup
      await backup.verify(userId, checksum);

      await SystemLog.logInfo('backup', 'backup_verified', `Backup ${backup.name} verified successfully`, {
        userId,
        resource: 'backup',
        resourceId: backup._id,
        metadata: { checksum }
      });

      return { verified: true, checksum };

    } catch (error) {
      await SystemLog.logError('backup', 'backup_verification_failed', 
        `Backup verification failed: ${error.message}`, {
        userId,
        resource: 'backup',
        resourceId: backup._id,
        metadata: { error: error.message }
      });

      throw error;
    }
  }

  async scheduleBackup(scheduleData, userId) {
    const backup = new Backup({
      ...scheduleData,
      createdBy: userId,
      schedule: {
        ...scheduleData.schedule,
        enabled: true
      }
    });

    await backup.save();

    await SystemLog.logInfo('backup', 'backup_scheduled', 
      `Backup scheduled: ${backup.name} (${scheduleData.schedule.frequency})`, {
      userId,
      resource: 'backup',
      resourceId: backup._id
    });

    return backup;
  }

  async getBackupStats() {
    const stats = await Backup.getBackupStats();
    const recentBackups = await Backup.getRecentBackups(5);
    const scheduledBackups = await Backup.getScheduledBackups();

    return {
      stats,
      recentBackups,
      scheduledBackups,
      totalBackups: await Backup.countDocuments(),
      totalSize: stats.reduce((sum, stat) => sum + stat.totalSize, 0)
    };
  }

  async cleanOldBackups(daysToKeep = 90) {
    const oldBackups = await Backup.cleanOldBackups();
    
    for (const backup of oldBackups) {
      try {
        await fs.unlink(backup.location);
        await backup.remove();
        
        await SystemLog.logInfo('backup', 'backup_deleted', 
          `Old backup deleted: ${backup.name}`, {
          resource: 'backup',
          resourceId: backup._id
        });
      } catch (error) {
        await SystemLog.logWarning('backup', 'backup_deletion_failed', 
          `Failed to delete backup ${backup.name}: ${error.message}`, {
          resource: 'backup',
          resourceId: backup._id,
          metadata: { error: error.message }
        });
      }
    }

    return { deleted: oldBackups.length };
  }
}

module.exports = new BackupService();
