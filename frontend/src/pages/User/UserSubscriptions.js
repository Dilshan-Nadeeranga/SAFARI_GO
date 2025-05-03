import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserSubscriptions = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState({
    show: false,
    message: '',
    plan: '',
    expiry: null
  });
  
  // Define premium plan options with more detailed benefits
  const plans = [
    {
      name: "Bronze",
      price: 9.99,
      duration: 1, // 1 month
      features: [
        "5% discount on all safari packages",
        "Email support within 24 hours",
        "Access to basic safari guides",
        "Booking notifications"
      ],
      description: "Perfect for first-time safari explorers",
      discountRate: 5,
      color: "from-amber-500 to-yellow-600"
    },
    {
      name: "Silver",
      price: 14.99,
      duration: 3, // 3 months
      features: [
        "10% discount on all safari packages",
        "Priority email support within 12 hours",
        "Access to premium safari guides",
        "Exclusive monthly newsletter",
        "Early access to new safari packages"
      ],
      description: "Great for regular adventurers",
      discountRate: 10,
      popular: true,
      color: "from-gray-400 to-gray-600"
    },
    {
      name: "Gold",
      price: 24.99,
      duration: 6, // 6 months
      features: [
        "15% discount on all safari packages",
        "24/7 priority support",
        "Full library of safari guides and e-books",
        "Exclusive webinars with safari experts",
        "VIP treatment on selected safaris",
        "Free merchandise with your first booking"
      ],
      description: "Ultimate experience for safari enthusiasts",
      discountRate: 15,
      color: "from-yellow-400 to-amber-600"
    },
  ];

  // Fetch current premium status when component mounts
  useEffect(() => {
    const fetchPremiumStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/LoginForm");
          return;
        }
        
        const response = await axios.get("http://localhost:8070/users/premium/status", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setIsPremium(response.data.isPremium);
        setPremiumUntil(response.data.premiumUntil);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching premium status:", error);
        setLoading(false);
      }
    };
    
    fetchPremiumStatus();
  }, [navigate]);

  // Handle subscription payment
  const handleSubscriptionPayment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/LoginForm");
        return;
      }
      
      const selectedPlanData = plans.find(p => p.name === selectedPlan);
      
      // Use the premium subscription endpoint
      const response = await axios.post(
        "http://localhost:8070/users/premium/subscribe",
        { 
          duration: selectedPlanData.duration,
          plan: selectedPlanData.name.toLowerCase()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.status === 200) {
        setIsPremium(true);
        setPremiumUntil(response.data.premiumUntil);
        
        // Show success message
        const successMessage = `Congratulations! You're now a ${selectedPlan} member! You'll get ${selectedPlanData.discountRate}% off on all safari packages until ${new Date(response.data.premiumUntil).toLocaleDateString()}.`;
        
        // Display success message in a modal-like component
        setSubscriptionSuccess({
          show: true,
          message: successMessage,
          plan: selectedPlan,
          expiry: response.data.premiumUntil
        });
        
        // Redirect to user profile after 3 seconds
        setTimeout(() => {
          navigate('/UserProfile'); // Redirect to user profile
        }, 3000);
      }
    } catch (error) {
      console.error("Error subscribing to premium:", error);
      alert("Failed to process subscription. Please try again.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      {/* Success Message Modal */}
      {subscriptionSuccess.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Subscription Complete!</h2>
              <p className="mb-4">{subscriptionSuccess.message}</p>
              <p className="text-sm text-gray-500 mb-4">Redirecting to your profile page...</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium member banner */}
      {isPremium && (
        <div className="mb-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2">You're a Premium Member! 🎉</h2>
          <p className="mb-1">Your premium benefits are active until: 
            <span className="font-semibold"> {new Date(premiumUntil).toLocaleDateString()}</span>
          </p>
          <p>Enjoy your discount on all safari packages!</p>
          <div className="mt-4 flex space-x-4">
            <button 
              onClick={() => navigate('/user/safaris')}
              className="px-4 py-2 bg-white text-purple-700 rounded-md hover:bg-gray-100 transition"
            >
              Browse Safaris
            </button>
            <button 
              onClick={() => navigate('/user/trips')}
              className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
            >
              My Trips
            </button>
          </div>
        </div>
      )}
    
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Premium Subscription Plans</h1>
      <p className="text-lg text-gray-600 mb-8">
        Upgrade to premium and enjoy exclusive discounts on all safari packages!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-lg shadow-md p-6 relative transition-all ${
              selectedPlan === plan.name ? "border-2 border-blue-500 shadow-lg transform -translate-y-1" : "hover:shadow-md"
            }`}
          >
            {/* Badge for most popular plan */}
            {plan.popular && (
              <div className="absolute -top-3 -right-3">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              </div>
            )}
          
            <div className={`bg-gradient-to-r ${plan.color} text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4`}>
              <h3 className="text-xl font-semibold mb-1">{plan.name} Plan</h3>
              <p className="opacity-90 text-sm">{plan.description}</p>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-gray-900">
                ${plan.price}
                <span className="text-sm font-normal text-gray-600">/{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
              </p>
              
              <div className="py-2 px-3 bg-blue-50 text-blue-700 rounded-md my-3 font-medium inline-block">
                {plan.discountRate}% off all safari packages
              </div>
            </div>
            
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="text-gray-700 flex items-center">
                  <span className="text-green-500 mr-2">✓</span> {feature}
                </li>
              ))}
            </ul>
            
            {selectedPlan === plan.name ? (
              <button
                onClick={handleSubscriptionPayment}
                className="w-full py-2 px-4 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Complete Subscription
              </button>
            ) : (
              <button
                className="w-full py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                onClick={() => setSelectedPlan(plan.name)}
              >
                Select Plan
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Subscription FAQs Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">What are the benefits of a premium subscription?</h3>
              <p className="text-gray-600 mt-2">Premium members get exclusive discounts on all safari packages, priority support, and access to special content and events.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800">How do I cancel my subscription?</h3>
              <p className="text-gray-600 mt-2">You can cancel your subscription at any time from your account settings. Your benefits will remain active until the end of your billing period.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Can I upgrade my plan?</h3>
              <p className="text-gray-600 mt-2">Yes, you can upgrade your plan at any time. The remaining value of your current subscription will be applied to your new plan.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800">How are discounts applied?</h3>
              <p className="text-gray-600 mt-2">Discounts are automatically applied at checkout when you book any safari package. The discount percentage depends on your subscription level.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSubscriptions;