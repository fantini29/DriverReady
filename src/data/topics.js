// Local fallback — used only when Supabase is unreachable.
// Source of truth is Supabase: topics + lessons tables.
// Only contains the original 5 topics. Vehicle Basics and Special Situations exist only in Supabase.

export const TOPICS = [
  {
    id: "signs",
    title: "Signs & Signals",
    icon: "🛑",
    color: "#ef4444",
    lessons: [
      {
        id: "signs_shapes",
        title: "Sign Shapes & Colors",
        content: [
          { type: "heading", text: "Why Shapes Matter" },
          { type: "text", text: "Road signs use shapes and colors so you can recognize them instantly — even before you can read the words. This is especially important at speed or in low visibility." },
          { type: "fact", label: "Octagon", text: "STOP sign only. Always means come to a complete stop." },
          { type: "fact", label: "Triangle (inverted)", text: "YIELD sign. Slow down and give right of way." },
          { type: "fact", label: "Diamond", text: "Warning signs. Yellow = general warning, orange = construction." },
          { type: "fact", label: "Rectangle", text: "Regulatory signs (speed limits, turns) or informational signs." },
          { type: "fact", label: "Pentagon", text: "School zone or school crossing signs." },
          { type: "tip", text: "Red signs are always regulatory — they tell you what you MUST or MUST NOT do. You can never ignore a red sign." },
        ]
      },
      {
        id: "traffic_lights",
        title: "Traffic Lights",
        content: [
          { type: "heading", text: "Reading Traffic Lights" },
          { type: "text", text: "Traffic lights control the flow of vehicles and protect pedestrians. Understanding every light variation is essential." },
          { type: "fact", label: "Solid Red", text: "Stop completely. Wait until green. You may turn right after stopping unless a sign says otherwise." },
          { type: "fact", label: "Solid Yellow", text: "Prepare to stop. Do NOT speed up to 'beat' the red — this causes accidents." },
          { type: "fact", label: "Solid Green", text: "Go, but yield to pedestrians and crossing traffic before entering the intersection." },
          { type: "fact", label: "Flashing Red", text: "Treat as a STOP sign. Come to a full stop, then proceed when safe." },
          { type: "fact", label: "Flashing Yellow", text: "Slow down and proceed with caution." },
          { type: "tip", text: "A green arrow means you have a protected turn — oncoming traffic is stopped by a red light." },
        ]
      },
    ]
  },
  {
    id: "rightofway",
    title: "Right of Way",
    icon: "🚦",
    color: "#f59e0b",
    lessons: [
      {
        id: "intersections",
        title: "Intersections",
        content: [
          { type: "heading", text: "Who Goes First?" },
          { type: "text", text: "Right-of-way rules prevent collisions at intersections. When in doubt, yield — no right of way is worth a crash." },
          { type: "fact", label: "4-Way Stop", text: "First to arrive goes first. Ties go to the driver on the right." },
          { type: "fact", label: "Uncontrolled Intersection", text: "Yield to vehicles already in the intersection, then to the vehicle on your right." },
          { type: "fact", label: "T-Intersection", text: "Traffic on the through road has right of way over traffic on the ending road." },
          { type: "tip", text: "Making eye contact with other drivers is NOT a legal right of way. Always follow the rules even if another driver waves you through." },
        ]
      },
      {
        id: "pedestrians",
        title: "Pedestrians & Cyclists",
        content: [
          { type: "heading", text: "Protecting Vulnerable Road Users" },
          { type: "text", text: "Pedestrians and cyclists are always at greater risk than drivers. The law — and common sense — requires extra care." },
          { type: "fact", label: "Crosswalks", text: "Always yield to pedestrians in a crosswalk, marked or unmarked. Stop and wait until they fully cross your lane." },
          { type: "fact", label: "School Zones", text: "Speed limits drop (usually 15–25 mph) during school hours. Flashers mean the zone is active." },
          { type: "fact", label: "Bikes", text: "Cyclists have the same rights as vehicles. Pass with at least 3 feet of clearance." },
          { type: "tip", text: "Never pass a stopped school bus with flashing red lights — traffic on BOTH sides of the road must stop." },
        ]
      },
    ]
  },
  {
    id: "speed",
    title: "Speed & Space",
    icon: "⚡",
    color: "#8b5cf6",
    lessons: [
      {
        id: "speed_limits",
        title: "Speed Limits",
        content: [
          { type: "heading", text: "Speed Limits & Safe Speeds" },
          { type: "text", text: "Speed limits set the maximum legal speed under ideal conditions. You must drive slower when conditions demand it." },
          { type: "fact", label: "Residential areas", text: "Typically 25 mph unless posted otherwise." },
          { type: "fact", label: "School zones", text: "15–25 mph when flashers are active." },
          { type: "fact", label: "Highways/Interstates", text: "55–70 mph, varies by state." },
          { type: "fact", label: "Basic speed law", text: "Even if under the limit, you must slow down for rain, fog, heavy traffic, or road hazards." },
          { type: "tip", text: "Speeding is the #1 factor in teen driver fatalities. Even 10 mph over doubles your stopping distance." },
        ]
      },
      {
        id: "following_distance",
        title: "Following Distance",
        content: [
          { type: "heading", text: "The 3-Second Rule" },
          { type: "text", text: "Tailgating is one of the most dangerous habits. Keeping proper following distance gives you time to react." },
          { type: "fact", label: "3-Second Rule", text: "Pick a fixed object. When the car ahead passes it, count 3 seconds. You should reach it no sooner." },
          { type: "fact", label: "Bad weather", text: "Double to 6+ seconds in rain, snow, or fog." },
          { type: "fact", label: "Large trucks", text: "Give extra space — they have massive blind spots and long stopping distances." },
          { type: "tip", text: "If you can't see the front wheels of the car ahead in your windshield, you're too close at a stop." },
        ]
      },
    ]
  },
  {
    id: "parking",
    title: "Parking & Passing",
    icon: "🅿️",
    color: "#06b6d4",
    lessons: [
      {
        id: "parking_rules",
        title: "Parking Rules",
        content: [
          { type: "heading", text: "Where You Can & Can't Park" },
          { type: "text", text: "Illegal parking blocks traffic, emergency vehicles, and creates hazards. Know the no-park zones cold." },
          { type: "fact", label: "Fire hydrant", text: "Stay at least 15 feet away." },
          { type: "fact", label: "Crosswalk/intersection", text: "At least 20–30 feet back (varies by state)." },
          { type: "fact", label: "Driveway", text: "Never block a driveway, including your own if it would block the sidewalk." },
          { type: "fact", label: "Hills", text: "Turn wheels toward curb when facing downhill, away from curb facing uphill." },
          { type: "tip", text: "Curb colors matter: Red = no stopping, Yellow = loading only, White = passenger pickup/dropoff, Green = limited time." },
        ]
      },
    ]
  },
  {
    id: "safety",
    title: "Safe Driving",
    icon: "🛡️",
    color: "#10b981",
    lessons: [
      {
        id: "distracted",
        title: "Distracted Driving",
        content: [
          { type: "heading", text: "Eyes on the Road" },
          { type: "text", text: "Distracted driving kills over 3,000 people per year in the US. Teens are disproportionately affected." },
          { type: "fact", label: "Phone use", text: "Texting takes your eyes off the road for ~5 seconds. At 55 mph, that's the length of a football field." },
          { type: "fact", label: "Hands-free", text: "Even hands-free calls are distracting. Many states ban handheld use entirely for new drivers." },
          { type: "fact", label: "Passengers", text: "Teen crash risk doubles with 1 teen passenger, triples with 2+. Many states restrict this on permits." },
          { type: "tip", text: "Put your phone in Do Not Disturb mode before starting the car. No text is worth your life." },
        ]
      },
      {
        id: "impaired",
        title: "Impaired Driving",
        content: [
          { type: "heading", text: "Zero Tolerance" },
          { type: "text", text: "For drivers under 21, most states have zero tolerance laws — any detectable alcohol can result in a DUI." },
          { type: "fact", label: "BAC limits", text: "Adults: 0.08% limit. Under 21: 0.00–0.02% in most states (zero tolerance)." },
          { type: "fact", label: "Medications", text: "Prescription and OTC drugs can impair driving. Check labels — if it says 'do not operate machinery,' don't drive." },
          { type: "fact", label: "Consequences", text: "DUI can mean license suspension, fines, jail time, and a permanent record." },
          { type: "tip", text: "If you've been drinking, there is no safe amount to drive. Call a ride, call a parent — no judgment is worse than the consequences." },
        ]
      },
    ]
  },
];
