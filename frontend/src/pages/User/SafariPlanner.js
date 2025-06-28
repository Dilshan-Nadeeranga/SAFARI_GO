import React, { useState } from "react";
import axios from "axios";
import { FaMapMarkedAlt, FaSpinner } from "react-icons/fa";

class SafariPreferences {
  constructor(weather, animals, travelMonth, budget) {
    this.weather = weather; // 'Hot', 'Cool', 'Mild'
    this.animals = animals; // Array, e.g., ['Elephants', 'Birds']
    this.travelMonth = travelMonth; // e.g., 'August'
    this.budget = budget; // 'Low', 'Medium', 'High'
  }
}

const SafariPlanner = () => {
  const [formData, setFormData] = useState({
    weather: "",
    animals: [],
    travelMonth: "",
    budget: "",
  });
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, animals: [...formData.animals, value] });
    } else {
      setFormData({
        ...formData,
        animals: formData.animals.filter((item) => item !== value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.weather || formData.animals.length === 0 || !formData.travelMonth || !formData.budget) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const preferences = new SafariPreferences(
        formData.weather,
        formData.animals,
        formData.travelMonth,
        formData.budget
      );
      const response = await axios.post("http://localhost:8070/api/ai-safari/plan", preferences);
      setItinerary(response.data);
      setIsLoading(false);
    } catch (error) {
      let errorMessage = error.message;
      if (error.response?.status === 429) {
        errorMessage = "We've reached our free API limit for now. Please try again later.";
      } else if (error.response?.data?.error?.includes("model not found") || error.response?.data?.error?.includes("authentication failed")) {
        errorMessage = "Unable to generate itinerary due to a configuration issue. Please contact support.";
      } else {
        errorMessage = error.response?.data?.error || "Failed to generate itinerary";
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50 flex flex-col items-center py-10">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-8 m-6">
        <div className="flex items-center mb-8">
          <FaMapMarkedAlt className="text-4xl text-blue-700 mr-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">Plan My Safari</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="weather" className="block text-sm font-semibold text-gray-700 mb-2">
              Weather Preference
            </label>
            <select
              name="weather"
              id="weather"
              value={formData.weather}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 form-select"
            >
              <option value="">Select Weather</option>
              <option value="Hot">Hot</option>
              <option value="Cool">Cool</option>
              <option value="Mild">Mild</option>
            </select>
          </div>

          <div>
            <label htmlFor="travelMonth" className="block text-sm font-semibold text-gray-700 mb-2">
              Travel Month
            </label>
            <select
              name="travelMonth"
              id="travelMonth"
              value={formData.travelMonth}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 form-select"
            >
              <option value="">Select Month</option>
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
              Budget
            </label>
            <select
              name="budget"
              id="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 form-select"
            >
              <option value="">Select Budget</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Animals to See</label>
            <div className="grid grid-cols-2 gap-4">
              {["Elephants", "Leopards", "Birds", "All"].map((animal) => (
                <div key={animal} className="flex items-center">
                  <input
                    type="checkbox"
                    id={animal}
                    value={animal}
                    checked={formData.animals.includes(animal)}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-600 border-gray-300 rounded form-check-input"
                  />
                  <label htmlFor={animal} className="ml-2 text-sm text-gray-600">{animal}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-700 to-green-600 text-white py-3 px-6 rounded-xl shadow-lg hover:from-blue-800 hover:to-green-700 transition-all flex items-center justify-center text-lg font-semibold ${
                isLoading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-3" />
                  Generating Your Safari...
                </>
              ) : (
                <>
                  <FaMapMarkedAlt className="mr-3" />
                  Plan My Safari
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-xl shadow-md">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {itinerary && (
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Safari Itinerary</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800&auto=format&fit=crop"
                alt="Safari"
                className="w-full md:w-1/3 rounded-xl"
              />
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  <strong>Location:</strong> {itinerary.location}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Dates:</strong> {itinerary.dates}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Package:</strong> {itinerary.package}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Duration:</strong> {itinerary.duration}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Estimated Cost:</strong> {itinerary.cost}
                </p>
                {/*<button
                  onClick={() => alert("Proceeding to booking...")}
                  className="bg-green-600 text-white py-2 px-4 rounded-xl shadow-lg hover:bg-green-700 transition-all"
                >
                  Book Now
                </button>
                <button
                  onClick={() => alert("Chat with SafariBot coming soon!")}
                  className="ml-4 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all"
                >
                  Chat with SafariBot
                </button>*/}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafariPlanner;