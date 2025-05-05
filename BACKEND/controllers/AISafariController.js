const axios = require("axios");
const SafariItinerary = require("../models/AISafariModel");

const planSafari = async (req, res) => {
  try {
    const { weather, animals, travelMonth, budget } = req.body;

    // Validate inputs
    if (!weather || !animals || animals.length === 0 || !travelMonth || !budget) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Call Gemini API
    try {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Create a safari itinerary for:
                - Weather: ${weather}
                - Animals: ${animals.join(", ")}
                - Month: ${travelMonth}
                - Budget: ${budget}
                Return a valid JSON object with fields: location, dates, package, duration, cost. Ensure the JSON is properly formatted, with all strings escaped correctly, no markdown, no trailing commas, and no extra text. Example:
                {
                  "location": "Udawalawe National Park",
                  "dates": "August 10–12",
                  "package": "2 nights, full board, guided tour",
                  "duration": "3 days",
                  "cost": "$300"
                }`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      // Extract and clean response
      let responseText = geminiResponse.data.candidates[0].content.parts[0].text;
      console.log("Raw Gemini API response:", responseText); // Log for debugging
      responseText = responseText.replace(/```json\n|```/g, "").trim();

      // Attempt to parse JSON with error handling
      let itineraryData;
      try {
        itineraryData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError.message);
        console.error("Invalid JSON:", responseText);
        // Attempt to sanitize common issues (e.g., unescaped quotes)
        try {
          responseText = responseText
            .replace(/(?<!\\)"/g, '\\"') // Escape unescaped quotes
            .replace(/,\s*}/g, "}") // Remove trailing commas
            .replace(/,\s*]/g, "]");
          itineraryData = JSON.parse(responseText);
        } catch (sanitizedParseError) {
          throw new Error(`Failed to parse Gemini API response: ${sanitizedParseError.message}`);
        }
      }

      // Validate required fields
      const requiredFields = ["location", "dates", "package", "duration", "cost"];
      const missingFields = requiredFields.filter((field) => !itineraryData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields in response: ${missingFields.join(", ")}`);
      }

      // Save to MongoDB
      const itinerary = new SafariItinerary({
        preferences: { weather, animals, travelMonth, budget },
        location: itineraryData.location,
        dates: itineraryData.dates,
        package: itineraryData.package,
        duration: itineraryData.duration,
        cost: itineraryData.cost,
      });
      await itinerary.save();

      res.json(itinerary);
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError.message);
      if (geminiError.response) {
        console.error("Gemini API response:", geminiError.response.data);
        if (geminiError.response.status === 429) {
          return res.status(429).json({ error: "API quota exceeded. Please try again later." });
        }
        if (geminiError.response.status === 404) {
          return res.status(502).json({ error: "Gemini API model not found. Please check the model name." });
        }
        if (geminiError.response.status === 401) {
          return res.status(502).json({ error: "Gemini API authentication failed. Please check the API key." });
        }
        return res.status(502).json({
          error: `Gemini API failed: ${geminiError.response.status} ${geminiError.response.statusText}`,
        });
      }
      throw geminiError;
    }
  } catch (error) {
    console.error("Error in planSafari:", error.message);
    res.status(500).json({ error: `Failed to generate itinerary: ${error.message}` });
  }
};

module.exports = { planSafari };