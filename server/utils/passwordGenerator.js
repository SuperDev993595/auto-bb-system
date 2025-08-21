/**
 * Generate a secure random password
 * @param {number} length - Length of password (default: 12)
 * @returns {string} - Generated password
 */
function generateSecurePassword(length = 12) {
  const charset = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  // Ensure at least one character from each category
  let password = '';
  password += charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
  password += charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
  password += charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
  password += charset.symbols[Math.floor(Math.random() * charset.symbols.length)];

  // Fill the rest with random characters
  const allChars = charset.lowercase + charset.uppercase + charset.numbers + charset.symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

module.exports = { generateSecurePassword };
