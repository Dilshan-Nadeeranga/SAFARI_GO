import React from "react";
import { useParams } from "react-router-dom";

const Article = () => {
  // Use useParams to get article ID from URL
  const { id } = useParams();

  // Sample article data - in a real application, this would come from an API or database
  const articles = {
    "1": {
      title: "Top 10 Safari Destinations",
      date: "May 05, 2025",
      image: "/assets/blog1.png",
      content: `
        <h2>Explore the World's Best Safari Destinations</h2>
        
        <p>Safari adventures offer some of the most breathtaking wildlife encounters on the planet. From the vast plains of the Serengeti to the lush landscapes of Borneo, these destinations provide unforgettable experiences for nature enthusiasts and adventure seekers alike.</p>
        
        <h3>1. Maasai Mara, Kenya</h3>
        <p>Known for the Great Migration, the Maasai Mara offers spectacular views of wildebeest, zebras, and predators. The best time to visit is between July and October when millions of animals cross the Mara River.</p>
        
        <h3>2. Serengeti National Park, Tanzania</h3>
        <p>Home to the largest terrestrial mammal migration in the world, the Serengeti is a UNESCO World Heritage site that spans approximately 30,000 square kilometers.</p>
        
        <h3>3. Kruger National Park, South Africa</h3>
        <p>One of Africa's largest game reserves, Kruger National Park covers nearly 2 million hectares and is home to an impressive diversity of wildlife including the Big Five.</p>
        
        <h3>4. Okavango Delta, Botswana</h3>
        <p>This inland delta is a unique ecosystem that floods annually, attracting diverse wildlife. Explore by traditional mokoro canoe for a different perspective.</p>
        
        <h3>5. Ranthambore National Park, India</h3>
        <p>Famous for its Bengal tigers, this former hunting ground of the Maharajas is now a major wildlife tourist attraction.</p>
        
        <h3>6. Galápagos Islands, Ecuador</h3>
        <p>Though not a traditional safari destination, the Galápagos offers incredible wildlife viewing opportunities with species found nowhere else on Earth.</p>
        
        <h3>7. Yellowstone National Park, USA</h3>
        <p>America's first national park is home to grizzly bears, wolves, bison, and the famous Old Faithful geyser.</p>
        
        <h3>8. Borneo</h3>
        <p>Split between Malaysia, Indonesia, and Brunei, Borneo offers jungle safaris where you can spot orangutans in their natural habitat.</p>
        
        <h3>9. Etosha National Park, Namibia</h3>
        <p>Centered around a vast salt pan, this park offers excellent game viewing, particularly during the dry season when animals gather at waterholes.</p>
        
        <h3>10. Pantanal, Brazil</h3>
        <p>The world's largest tropical wetland area is a biodiversity hotspot and one of the best places to see jaguars in the wild.</p>
        
        <h2>Planning Your Safari Adventure</h2>
        <p>When planning your safari, consider factors such as the season, the specific wildlife you want to see, and your accommodation preferences. Many destinations offer options ranging from luxury lodges to tented camps for a more authentic experience.</p>
        
        <p>Remember to prioritize responsible tourism by choosing operators committed to conservation and community support. With proper planning, your safari adventure will provide memories to last a lifetime while contributing to the preservation of these incredible ecosystems.</p>
      `
    },
    "2": {
      title: "Wildlife Photography Tips",
      date: "May 04, 2025",
      image: "/assets/blog2.png",
      content: `
        <h2>Master the Art of Wildlife Photography on Safari</h2>
        
        <p>Capturing stunning wildlife photographs during your safari adventure requires preparation, patience, and a bit of technical know-how. Here are essential tips to help you bring home remarkable images.</p>
        
        <h3>Equipment Essentials</h3>
        <p>While professional gear can enhance your photography, even a good smartphone or entry-level camera can capture remarkable moments. Consider these essentials:</p>
        <ul>
          <li>A camera with good zoom capabilities (at least 300mm equivalent)</li>
          <li>Extra memory cards and batteries</li>
          <li>A sturdy camera bag that protects against dust</li>
          <li>A beanbag or small tripod for stability in vehicles</li>
          <li>Lens cleaning kit</li>
        </ul>
        
        <h3>Camera Settings for Wildlife</h3>
        <p>Wildlife often moves quickly, requiring specific camera settings:</p>
        <ul>
          <li><strong>Shutter Priority Mode:</strong> Use a minimum of 1/500s for moving animals</li>
          <li><strong>Continuous Autofocus:</strong> Keep moving subjects sharp</li>
          <li><strong>Burst Mode:</strong> Increase chances of capturing the perfect moment</li>
          <li><strong>ISO:</strong> Don't fear raising it in low light - a grainy photo is better than a blurry one</li>
        </ul>
        
        <h3>Composition Techniques</h3>
        <p>Great wildlife photography isn't just about getting close to animals:</p>
        <ul>
          <li>Follow the rule of thirds - position your subject off-center</li>
          <li>Leave space in the direction the animal is facing or moving</li>
          <li>Include environmental context when possible</li>
          <li>Look for interesting behavior rather than just portraits</li>
          <li>Try shooting from different angles - get low when possible</li>
        </ul>
        
        <h3>Light Considerations</h3>
        <p>The golden hours of early morning and late afternoon provide the best light for wildlife photography. The soft, warm light during these times creates beautiful highlights and shadows that add dimension to your subjects. Mid-day light can be harsh but can work well for black and white photography.</p>
        
        <h3>Behavior and Patience</h3>
        <p>Understanding animal behavior will significantly improve your photography:</p>
        <ul>
          <li>Research species before your trip to anticipate behaviors</li>
          <li>Be patient - great wildlife photography often requires waiting</li>
          <li>Look for signs of interesting activity about to happen</li>
          <li>Capture sequences of behavior rather than single shots</li>
        </ul>
        
        <h3>Ethical Considerations</h3>
        <p>Always prioritize animal welfare over getting the perfect shot:</p>
        <ul>
          <li>Never pressure guides to get closer than is safe or legal</li>
          <li>Avoid flash photography around sensitive species</li>
          <li>Follow park rules and regulations</li>
          <li>Don't disturb animals to create "better" photo opportunities</li>
        </ul>
        
        <p>With practice and patience, you'll return from your safari with photographs that tell compelling stories of the wild. Focus on enjoying the experience first - often the best photographs come when you're fully immersed in the wonder of wildlife observation.</p>
      `
    },
    "3": {
      title: "Safari Packing Guide",
      date: "May 03, 2025",
      image: "/assets/blog3.png",
      content: `
        <h2>The Essential Safari Packing Guide</h2>
        
        <p>Preparing for a safari adventure requires thoughtful packing to ensure comfort, safety, and the best possible experience. This comprehensive guide covers everything you need from clothing to equipment.</p>
        
        <h3>Clothing Essentials</h3>
        <p>Safari clothing should be comfortable, durable, and appropriate for changing weather conditions:</p>
        <ul>
          <li><strong>Neutral Colors:</strong> Pack khaki, olive, tan, and brown clothes that blend with the environment and don't attract insects</li>
          <li><strong>Layering Pieces:</strong> Mornings can be cool, while afternoons get hot - bring items you can easily add or remove</li>
          <li><strong>Long Sleeves/Pants:</strong> Even in hot weather, these protect against sun and insects</li>
          <li><strong>Rain Jacket:</strong> Lightweight and packable for unexpected showers</li>
          <li><strong>Hat:</strong> Wide-brimmed for sun protection</li>
          <li><strong>Sturdy Footwear:</strong> Comfortable walking shoes or hiking boots</li>
          <li><strong>Bandana/Buff:</strong> Multi-purpose item for dust protection, sun coverage, etc.</li>
        </ul>
        
        <h3>Personal Items</h3>
        <p>Beyond clothing, these items enhance comfort and safety:</p>
        <ul>
          <li><strong>High SPF Sunscreen:</strong> Reapply frequently</li>
          <li><strong>Insect Repellent:</strong> Products containing DEET or picaridin</li>
          <li><strong>Personal First Aid Kit:</strong> Include basics plus any prescription medications</li>
          <li><strong>Hand Sanitizer:</strong> Facilities may be limited in the wilderness</li>
          <li><strong>Lip Balm with SPF:</strong> Prevents painful cracking in dry conditions</li>
          <li><strong>Sunglasses:</strong> Polarized lenses reduce glare</li>
          <li><strong>Toiletries:</strong> Pack travel sizes of essentials</li>
        </ul>
        
        <h3>Safari Equipment</h3>
        <p>These tools enhance wildlife viewing and documentation:</p>
        <ul>
          <li><strong>Binoculars:</strong> Essential for spotting distant wildlife</li>
          <li><strong>Camera:</strong> With zoom lens and extra batteries/memory cards</li>
          <li><strong>Power Bank:</strong> For recharging devices when electricity is unavailable</li>
          <li><strong>Headlamp/Flashlight:</strong> With extra batteries</li>
          <li><strong>Day Pack:</strong> For carrying essentials during game drives</li>
          <li><strong>Reusable Water Bottle:</strong> Stay hydrated throughout the day</li>
        </ul>
        
        <h3>Documents and Money</h3>
        <p>Keep these secure and accessible:</p>
        <ul>
          <li>Passport and visas</li>
          <li>Travel insurance information</li>
          <li>Vaccination certificates (especially Yellow Fever if required)</li>
          <li>Cash in small denominations for tips and purchases</li>
          <li>Credit cards (inform your bank of travel plans)</li>
        </ul>
        
        <h3>Special Considerations</h3>
        <p>Depending on your destination and activities:</p>
        <ul>
          <li><strong>Malaria Prophylaxis:</strong> Consult your doctor about appropriate medications</li>
          <li><strong>Sleeping Bag Liner:</strong> For basic accommodations</li>
          <li><strong>Guidebooks:</strong> Wildlife identification guides enhance the experience</li>
          <li><strong>Ear Plugs:</strong> Wildlife can be noisy at night</li>
          <li><strong>Binoculars Harness:</strong> Keeps them accessible without bouncing</li>
        </ul>
        
        <h3>Packing Tips</h3>
        <p>Maximize space and convenience with these approaches:</p>
        <ul>
          <li>Use packing cubes to organize and compress clothing</li>
          <li>Pack lightweight, quick-dry fabrics when possible</li>
          <li>Bring clothes you can rinse out by hand if necessary</li>
          <li>Consider luggage weight restrictions on small aircraft</li>
          <li>Leave valuable jewelry and unnecessary electronics at home</li>
        </ul>
        
        <p>With proper preparation, you'll be comfortable and ready to focus on the incredible wildlife experiences ahead. Remember that simplicity often makes for the most enjoyable safari experience!</p>
      `
    },
    "4": {
      title: "Conservation Efforts in Africa",
      date: "May 02, 2025",
      image: "/assets/blog4.png",
      content: `
        <h2>Wildlife Conservation in Africa: Progress and Challenges</h2>
        
        <p>Africa's iconic wildlife faces unprecedented threats from habitat loss, poaching, and climate change. However, innovative conservation approaches are showing promising results across the continent. This article explores current efforts to protect Africa's biodiversity heritage.</p>
        
        <h3>Community-Based Conservation</h3>
        <p>One of the most significant shifts in conservation strategy has been the move toward community involvement. When local communities benefit directly from conservation, they become its strongest advocates:</p>
        <ul>
          <li><strong>Conservancies:</strong> In Kenya and Namibia, community-managed conservancies provide income through tourism while protecting wildlife</li>
          <li><strong>Revenue Sharing:</strong> Programs that direct a percentage of park fees to surrounding communities</li>
          <li><strong>Employment Opportunities:</strong> Training local residents as rangers, guides, and hospitality staff</li>
          <li><strong>Sustainable Resource Use:</strong> Carefully managed programs that allow communities to benefit from natural resources without depleting them</li>
        </ul>
        
        <h3>Anti-Poaching Innovations</h3>
        <p>The battle against poaching has evolved with technology:</p>
        <ul>
          <li><strong>Drone Surveillance:</strong> Unmanned aerial vehicles monitor vast areas efficiently</li>
          <li><strong>AI-Powered Camera Traps:</strong> Instantly alert rangers to suspicious activity</li>
          <li><strong>GPS Tracking:</strong> Monitoring key species and herds to detect unusual movements</li>
          <li><strong>Forensic Technology:</strong> DNA analysis helps trace seized wildlife products</li>
          <li><strong>K-9 Units:</strong> Highly trained dogs track poachers and detect wildlife products</li>
        </ul>
        
        <h3>Habitat Restoration Projects</h3>
        <p>Restoring degraded landscapes is crucial for wildlife recovery:</p>
        <ul>
          <li><strong>Reforestation:</strong> Large-scale tree planting in previously deforested areas</li>
          <li><strong>Invasive Species Removal:</strong> Eliminating plants and animals that threaten native ecosystems</li>
          <li><strong>Wetland Rehabilitation:</strong> Restoring critical water sources for wildlife</li>
          <li><strong>Corridor Creation:</strong> Establishing protected pathways between fragmented habitats</li>
        </ul>
        
        <h3>Species-Specific Conservation Programs</h3>
        <p>Some of Africa's most endangered species benefit from targeted interventions:</p>
        <ul>
          <li><strong>Rhino Conservation:</strong> Dehorning programs, intensive protection zones, and breeding initiatives</li>
          <li><strong>Elephant Protection:</strong> Collaring programs, human-elephant conflict mitigation, and ivory demand reduction</li>
          <li><strong>Great Ape Conservation:</strong> Protected forest management, disease prevention, and anti-poaching efforts</li>
          <li><strong>Predator Conservation:</strong> Compensation schemes for livestock losses and education programs</li>
        </ul>
        
        <h3>Sustainable Tourism Models</h3>
        <p>Tourism can either harm or help conservation efforts, depending on how it's managed:</p>
        <ul>
          <li><strong>Eco-certification:</strong> Standards for lodges and tour operators</li>
          <li><strong>Visitor Number Management:</strong> Preventing overtourism in sensitive areas</li>
          <li><strong>Conservation Fees:</strong> Direct funding of protection efforts through tourism revenue</li>
          <li><strong>Educational Tourism:</strong> Creating ambassadors for conservation through meaningful experiences</li>
        </ul>
        
        <h3>Challenges Ahead</h3>
        <p>Despite progress, significant obstacles remain:</p>
        <ul>
          <li><strong>Population Growth:</strong> Increasing human settlements in wildlife areas</li>
          <li><strong>Climate Change:</strong> Altering habitats and migration patterns</li>
          <li><strong>Infrastructure Development:</strong> Roads and construction fragmenting habitats</li>
          <li><strong>Funding Gaps:</strong> Conservation initiatives requiring sustainable financial models</li>
          <li><strong>International Wildlife Trade:</strong> Continued demand for wildlife products</li>
        </ul>
        
        <h3>How Travelers Can Support Conservation</h3>
        <p>Safari-goers play a crucial role in conservation:</p>
        <ul>
          <li>Choose operators with demonstrated conservation commitments</li>
          <li>Visit community conservancies and support local enterprises</li>
          <li>Respect wildlife viewing guidelines and park rules</li>
          <li>Consider contributing to reputable conservation organizations</li>
          <li>Share conservation messages when discussing your safari experiences</li>
        </ul>
        
        <p>The future of Africa's wildlife depends on balanced approaches that meet human needs while protecting biodiversity. By supporting effective conservation initiatives, we can help ensure these magnificent animals and landscapes survive for generations to come.</p>
      `
    },
    "5": {
      title: "Best Safari Vehicles",
      date: "May 01, 2025",
      image: "/assets/article5.jpeg",
      content: `
        <h2>The Ultimate Guide to Safari Vehicles</h2>
        
        <p>The vehicle you use on safari significantly impacts your wildlife viewing experience. From traditional jeeps to specialized photography vehicles, each option offers different advantages. This guide explores the best safari vehicles and helps you choose the right one for your adventure.</p>
        
        <h3>Open-Sided Safari Vehicles</h3>
        <p>The classic choice for photography and immersive experiences:</p>
        <ul>
          <li><strong>Advantages:</strong> Unobstructed views, excellent photography opportunities, immersive experience with sounds and smells of the bush</li>
          <li><strong>Disadvantages:</strong> Limited protection from elements, less comfortable on longer drives</li>
          <li><strong>Best for:</strong> Photography enthusiasts, dedicated wildlife safaris in good weather</li>
          <li><strong>Popular models:</strong> Customized Land Rover Defenders and Toyota Land Cruisers with tiered seating</li>
        </ul>
        
        <h3>Closed Safari Vehicles with Pop-Top Roofs</h3>
        <p>A versatile option balancing comfort and viewing opportunities:</p>
        <ul>
          <li><strong>Advantages:</strong> Protection from weather, dust and wind, comfortable seating, good standing views through roof hatches</li>
          <li><strong>Disadvantages:</strong> Limited side visibility in some models, less immersive than fully open vehicles</li>
          <li><strong>Best for:</strong> Mixed weather conditions, longer game drives, family safaris</li>
          <li><strong>Popular models:</strong> Toyota Land Cruiser 70 Series, modified minivans in East Africa</li>
        </ul>
        
        <h3>Specialized Photography Vehicles</h3>
        <p>Designed specifically for wildlife photographers:</p>
        <ul>
          <li><strong>Advantages:</strong> Camera supports, charging facilities, flexible positioning, fewer passengers</li>
          <li><strong>Disadvantages:</strong> Premium pricing, often must be booked as private vehicle</li>
          <li><strong>Best for:</strong> Serious photographers, photo safaris</li>
          <li><strong>Features:</strong> Bean bag supports, gimbal mounts, dust protection systems, unobstructed views</li>
        </ul>
        
        <h3>4x4 Self-Drive Vehicles</h3>
        <p>For independent safari adventures:</p>
        <ul>
          <li><strong>Advantages:</strong> Freedom to explore at your own pace, cost-effective for longer trips</li>
          <li><strong>Disadvantages:</strong> No guide expertise, potentially missing wildlife, navigation challenges</li>
          <li><strong>Best for:</strong> Experienced safari-goers, budget travelers, longer itineraries</li>
          <li><strong>Popular choices:</strong> Toyota Hilux, Ford Ranger, equipped Land Rovers with roof tents</li>
        </ul>
        
        <h3>Specialized Terrain Vehicles</h3>
        <p>For unique environments and experiences:</p>
        <ul>
          <li><strong>Safari Boats:</strong> Essential for water-based wildlife viewing in places like the Okavango Delta</li>
          <li><strong>Walking Safari Support Vehicles:</strong> Carrying supplies while guests walk between points</li>
          <li><strong>Amphibious Vehicles:</strong> Navigating both land and shallow water in wetland ecosystems</li>
        </ul>
        
        <h3>Luxury Safari Vehicles</h3>
        <p>Premium options for maximum comfort:</p>
        <ul>
          <li><strong>Advantages:</strong> Enhanced comfort features, fewer passengers, premium viewing positions</li>
          <li><strong>Features:</strong> Refrigerators, comfortable seating, charging ports, WiFi capabilities</li>
          <li><strong>Best for:</strong> Luxury safaris, older travelers, those prioritizing comfort</li>
        </ul>
        
        <h3>Choosing the Right Vehicle for Your Safari</h3>
        <p>Consider these factors when selecting your safari vehicle:</p>
        <ul>
          <li><strong>Destination:</strong> Different parks and reserves have different requirements and terrain</li>
          <li><strong>Season:</strong> Open vehicles are wonderful in dry season but challenging in rainy periods</li>
          <li><strong>Group Size:</strong> Smaller vehicles often provide better experiences but at higher cost</li>
          <li><strong>Photography Goals:</strong> Serious photographers should prioritize vehicles designed for imaging</li>
          <li><strong>Physical Needs:</strong> Some vehicles are more accessible for those with mobility limitations</li>
          <li><strong>Duration:</strong> Comfort becomes increasingly important on longer game drives</li>
        </ul>
        
        <h3>Questions to Ask Your Safari Operator</h3>
        <p>Before booking, inquire about:</p>
        <ul>
          <li>Maximum number of passengers per vehicle</li>
          <li>Window seat guarantees</li>
          <li>Vehicle age and maintenance protocols</li>
          <li>Charging facilities for electronics</li>
          <li>Special features for photography if relevant</li>
          <li>Weather protection options</li>
        </ul>
        
        <p>The right safari vehicle enhances your wildlife viewing experience immeasurably. By considering your priorities and asking the right questions, you can ensure your transportation supports the safari experience you're seeking.</p>
      `
    },
    "6": {
      title: "Night Safari Experiences",
      date: "April 30, 2025",
      image: "/assets/article6.png",
      content: `
        <h2>Into the Darkness: The Magic of Night Safaris</h2>
        
        <p>As the sun sets over the savanna, a different world emerges. Night safaris offer unique opportunities to witness nocturnal wildlife and experience the bush in a completely different light – or rather, darkness. This guide explores what makes night safaris special and what you can expect on these thrilling adventures.</p>
        
        <h3>Why Experience a Night Safari?</h3>
        <p>Night drives reveal aspects of the wilderness most visitors never see:</p>
        <ul>
          <li>Opportunity to observe nocturnal species rarely seen during daylight</li>
          <li>Different behaviors from familiar animals under cover of darkness</li>
          <li>Heightened senses as you rely more on sounds and movement</li>
          <li>Dramatic hunting scenes as many predators prefer hunting at night</li>
          <li>Stunning stargazing opportunities away from light pollution</li>
        </ul>
        
        <h3>Nocturnal Wildlife to Look For</h3>
        <p>The night reveals creatures that remain hidden during daylight hours:</p>
        <ul>
          <li><strong>Aardvarks:</strong> These elusive insectivores emerge to feed on termites</li>
          <li><strong>Bushbabies:</strong> Listen for their distinctive calls and watch for their impressive leaps</li>
          <li><strong>Genets:</strong> These spotted, cat-like creatures move with incredible agility through trees</li>
          <li><strong>Civets:</strong> Distinctive masked faces and spotted bodies</li>
          <li><strong>Porcupines:</strong> Africa's largest rodents forage at night</li>
          <li><strong>Nightjars:</strong> Masters of camouflage during day, active hunters at night</li>
          <li><strong>Owls:</strong> From tiny pearl-spotted owlets to impressive Verreaux's eagle-owls</li>
          <li><strong>Lions and Leopards:</strong> Often more active and hunting during nighttime hours</li>
          <li><strong>Honey Badgers:</strong> Fearless foragers that typically operate after dark</li>
          <li><strong>Hyenas:</strong> Not just scavengers, they're skilled hunters under cover of darkness</li>
        </ul>
        
        <h3>What to Expect on a Night Safari</h3>
        <p>The experience differs from daytime game drives in several ways:</p>
        <ul>
          <li><strong>Spotlights:</strong> Guides use red-filtered spotlights that don't disturb wildlife</li>
          <li><strong>Different Pace:</strong> Typically slower driving to spot eye-shine and movement</li>
          <li><strong>Heightened Suspense:</strong> Limited visibility creates mystery and excitement</li>
          <li><strong>Different Sounds:</strong> The bush comes alive with calls, rustles, and roars</li>
          <li><strong>Smaller Groups:</strong> Many lodges run night drives with fewer participants</li>
        </ul>
        
        <h3>Where to Experience Night Safaris</h3>
        <p>Not all parks and reserves permit night drives. Some of the best destinations include:</p>
        <ul>
          <li><strong>South Luangwa, Zambia:</strong> Pioneered walking safaris and excellent for night drives</li>
          <li><strong>Kruger Private Concessions, South Africa:</strong> Areas bordering Kruger National Park allow night activities</li>
          <li><strong>Ongava Reserve, Namibia:</strong> Excellent nocturnal wildlife viewing</li>
          <li><strong>Masai Mara Conservancies, Kenya:</strong> Private conservancies permit night drives (unlike the main reserve)</li>
          <li><strong>Selous Game Reserve, Tanzania:</strong> One of Tanzania's few areas allowing night safaris</li>
        </ul>
        
        <h3>Photography Tips for Night Safaris</h3>
        <p>Capturing images in low light presents challenges:</p>
        <ul>
          <li>Use a camera with good high-ISO performance</li>
          <li>Bring a fast lens (f/2.8 or wider)</li>
          <li>Use a bean bag for stability</li>
          <li>Set expectations appropriately - many sightings are memories rather than photos</li>
          <li>Consider infrared photography if your camera supports it</li>
          <li>Try long-exposure star trail photography during stops</li>
        </ul>
        
        <h3>What to Bring on a Night Safari</h3>
        <p>Be prepared for the unique conditions:</p>
        <ul>
          <li>Warm layers - temperatures drop significantly after sunset</li>
          <li>Small personal flashlight with red filter</li>
          <li>Binoculars with good light-gathering capacity</li>
          <li>Camera equipment suited for low light</li>
          <li>Insect repellent - many insects are more active at night</li>
        </ul>
        
        <h3>Safety Considerations</h3>
        <p>Night safaris are conducted with safety as a priority:</p>
        <ul>
          <li>Always follow guide instructions about movement and noise</li>
          <li>Remain seated in the vehicle unless specifically instructed otherwise</li>
          <li>Never use bright white lights or camera flashes without permission</li>
          <li>Speak quietly to avoid disturbing wildlife</li>
        </ul>
        
        <p>A night safari adds an unforgettable dimension to the traditional wildlife experience. The combination of mystery, unique sightings, and the primal feeling of being in the wilderness after dark creates memories that last a lifetime. When planning your next safari adventure, be sure to include at least one venture into the darkness.</p>
      `
    }
  };

  const article = articles[id];

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Article Not Found</h1>
        <p className="text-lg text-gray-700 mb-6">Sorry, the article you're looking for doesn't exist.</p>
        <a href="/blog" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Return to Blog
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 md:p-10">
          {/* Article Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">{article.title}</h1>
          <p className="text-gray-500 mb-6">{article.date}</p>
          
          {/* Article Image */}
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-auto object-cover rounded-lg mb-8"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
              e.target.alt = "Image failed to load";
            }}
          />
          
          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          {/* Back to Blog Link */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <a 
              href="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Articles
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Article;