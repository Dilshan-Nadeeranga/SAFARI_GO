const User = require('../models/User');

// Calculate discount for a user based on their premium status
exports.calculateDiscount = async (userId, originalPrice) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if user is premium and subscription is still active
    const isPremiumActive = user.isPremium && user.premiumUntil > new Date();
    
    // Define discount rate - 15% for premium users
    const discountRate = isPremiumActive ? 0.15 : 0;
    const discountAmount = originalPrice * discountRate;
    const finalPrice = originalPrice - discountAmount;
    
    return {
      originalPrice,
      discountRate: discountRate * 100, // Convert to percentage
      discountAmount,
      finalPrice,
      isPremium: isPremiumActive
    };
  } catch (error) {
    console.error('Error calculating discount:', error);
    throw error;
  }
};

// Apply discount to an array of packages or products
exports.applyDiscountsToPackages = async (userId, packages) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if user is premium and subscription is still active
    const isPremiumActive = user.isPremium && user.premiumUntil > new Date();
    const discountRate = isPremiumActive ? 0.15 : 0;
    
    // Apply discount to each package
    return packages.map(pkg => {
      const discountAmount = pkg.price * discountRate;
      return {
        ...pkg,
        originalPrice: pkg.price,
        discountRate: discountRate * 100, // Convert to percentage
        discountAmount,
        finalPrice: pkg.price - discountAmount,
        isPremiumDiscount: isPremiumActive
      };
    });
  } catch (error) {
    console.error('Error applying discounts to packages:', error);
    throw error;
  }
};
