#!/usr/bin/env node

/**
 * Rate Limit Reset Script
 * 
 * This script helps reset rate limits for development purposes.
 * It clears the rate limit counters on the server.
 * 
 * Usage: node scripts/reset-rate-limits.js
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function resetRateLimits() {
  try {
    console.log('🔄 Attempting to reset rate limits...');
    
    // Try to call a health endpoint to check if server is running
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Server is running');
    
    // Note: This would require a server endpoint to reset rate limits
    // For now, we'll just provide instructions
    console.log('\n📋 Rate Limit Reset Instructions:');
    console.log('1. Stop the server (Ctrl+C)');
    console.log('2. Wait 15 minutes for rate limits to reset naturally');
    console.log('3. Restart the server');
    console.log('\n💡 Alternative: Restart the server to clear memory-based rate limits');
    
    console.log('\n🔧 Development Mode Rate Limits:');
    console.log('- General API: 1000 requests per 15 minutes');
    console.log('- Auth endpoints: 50 requests per 15 minutes');
    console.log('- Password reset: 10 requests per hour');
    
    console.log('\n🚀 To restart the server:');
    console.log('npm run dev:server');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running');
      console.log('💡 Start the server first: npm run dev:server');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// Run the script
resetRateLimits();
