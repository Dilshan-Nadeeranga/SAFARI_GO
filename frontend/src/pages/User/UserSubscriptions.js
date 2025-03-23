// frontend/src/pages/User/UserSubscriptions.js
import React, { useState } from "react";
import axios from "axios";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom"; // Added for navigation

const UserSubscriptions = () => {
  const navigate = useNavigate(); // Added for navigation
  const [selectedPlan, setSelectedPlan] = useState(null);
  const plans = [
    {
      name: "Bronze",
      price: 9.99,
      features: ["Basic features", "Limited access", "Email support", "Community access"],
      description: "Perfect for beginners",
    },
    {
      name: "Silver",
      price: 12.99,
      features: ["Advanced features", "Priority support", "Exclusive content", "Ad-free experience"],
      description: "Great for regular users",
    },
    {
      name: "Gold",
      price: 14.99,
      features: ["All features", "24/7 support", "Exclusive perks", "Early access to new features"],
      description: "Best for power users",
    },
  ];

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: plans.find((p) => p.name === selectedPlan).price.toString(),
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/LoginForm");
        return;
      }
      const order = await actions.order.capture();
      const response = await axios.post(
        "http://localhost:8070/users/subscribe",
        { plan: selectedPlan },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        alert(`Subscribed to ${selectedPlan} plan successfully!`);
        setSelectedPlan(null); // Reset selection after successful subscription
      }
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      alert("Failed to subscribe to plan.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 mb-6">Select a plan that suits your needs and enjoy exclusive benefits.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`border border-gray-200 rounded-lg p-6 text-center transition-shadow ${
                  selectedPlan === plan.name ? "border-blue-500 shadow-lg" : "hover:shadow-md"
                }`}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </p>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2 px-4 rounded-md transition-colors ${
                    selectedPlan === plan.name
                      ? "bg-blue-600 text-white cursor-default"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  {selectedPlan === plan.name ? "Selected" : "Subscribe"}
                </button>
                {selectedPlan === plan.name && plan.price > 0 && (
                  <div className="mt-4">
                    <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={(err) => console.error("PayPal error:", err)}
                    />
                  </div>
                )}
                {selectedPlan === plan.name && plan.price === 0 && (
                  <button
                    className="mt-4 w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    onClick={() => onApprove(null, { order: { capture: () => {} } })}
                  >
                    Subscribe for Free
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSubscriptions;