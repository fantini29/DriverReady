// Local question bank — used only as offline fallback when Supabase is unreachable.
// The source of truth is the Supabase `questions` table.
// To expand the question bank, add rows to Supabase — do not add to this file.

export const QUESTIONS = [
  // Signs & Signals
  { id: 1, topic: "signs", difficulty: 1, question: "An octagon-shaped sign always means:", options: ["Yield","Stop","Warning","School Zone"], answer: 1 },
  { id: 2, topic: "signs", difficulty: 1, question: "What color are warning signs?", options: ["Red","Blue","Yellow/Orange","Green"], answer: 2 },
  { id: 3, topic: "signs", difficulty: 2, question: "A flashing red traffic light means:", options: ["Slow down","Yield","Stop, then proceed when safe","Stop, wait for green"], answer: 2 },
  { id: 4, topic: "signs", difficulty: 1, question: "A pentagon-shaped sign indicates:", options: ["A hospital nearby","A school zone","A no-passing zone","A railroad crossing"], answer: 1 },
  { id: 5, topic: "signs", difficulty: 2, question: "A green arrow traffic signal means:", options: ["Yield before turning","You have a protected turn","Pedestrians have right of way","Speed up to clear the intersection"], answer: 1 },
  { id: 6, topic: "signs", difficulty: 3, question: "An inverted triangle sign means:", options: ["Stop completely","Yield right of way","No entry","Speed limit ahead"], answer: 1 },
  // Right of Way
  { id: 7, topic: "rightofway", difficulty: 1, question: "At a 4-way stop, two cars arrive at exactly the same time. Who goes first?", options: ["The car going straight","The car on the left","The car on the right","The faster car"], answer: 2 },
  { id: 8, topic: "rightofway", difficulty: 2, question: "When must you stop for a school bus with flashing red lights?", options: ["Only if you're behind it","Only in a school zone","Both directions unless a divided highway median separates you","Only on roads with speed limits under 35 mph"], answer: 2 },
  { id: 9, topic: "rightofway", difficulty: 1, question: "You approach an unmarked crosswalk. A pedestrian is waiting to cross. You must:", options: ["Honk to alert them","Slow down and proceed if clear","Yield and stop to let them cross","Flash your lights"], answer: 2 },
  { id: 10, topic: "rightofway", difficulty: 2, question: "At a T-intersection with no signs, who has right of way?", options: ["The car on the ending road","The car on the through road","Whichever car arrived first","The car turning left"], answer: 1 },
  { id: 11, topic: "rightofway", difficulty: 3, question: "When turning left at a green light (no arrow), you must:", options: ["Proceed — green means go","Yield to oncoming traffic and pedestrians","Honk to warn pedestrians","Only turn if no cars are visible"], answer: 1 },
  // Speed & Space
  { id: 12, topic: "speed", difficulty: 1, question: "The 3-second rule helps you maintain:", options: ["Proper speed","Safe following distance","Safe lane position","Proper turn signal timing"], answer: 1 },
  { id: 13, topic: "speed", difficulty: 1, question: "The typical speed limit in a residential neighborhood is:", options: ["15 mph","25 mph","35 mph","45 mph"], answer: 1 },
  { id: 14, topic: "speed", difficulty: 2, question: "You are driving the speed limit but conditions are icy. You should:", options: ["Maintain speed — you're legal","Turn on hazard lights and maintain speed","Reduce speed for conditions","Pull over immediately"], answer: 2 },
  { id: 15, topic: "speed", difficulty: 2, question: "In bad weather, following distance should increase to at least:", options: ["4 seconds","6 seconds","8 seconds","2 seconds"], answer: 1 },
  { id: 16, topic: "speed", difficulty: 3, question: "The 'basic speed law' means:", options: ["You must always drive the posted limit","You must drive safely for conditions, even if that means below the limit","You can exceed the limit if traffic requires it","Speed limits are advisory only on highways"], answer: 1 },
  // Parking & Passing
  { id: 17, topic: "parking", difficulty: 1, question: "How far must you park from a fire hydrant?", options: ["5 feet","10 feet","15 feet","25 feet"], answer: 2 },
  { id: 18, topic: "parking", difficulty: 2, question: "You're parked on a hill facing downhill, with a curb. Wheels should be turned:", options: ["Straight ahead","Away from the curb","Toward the curb","Doesn't matter"], answer: 2 },
  { id: 19, topic: "parking", difficulty: 1, question: "A red-painted curb means:", options: ["Limited-time parking","Loading zone only","No stopping or parking at any time","Emergency vehicles only"], answer: 2 },
  { id: 20, topic: "parking", difficulty: 2, question: "Which of the following is LEGAL parking?", options: ["In front of a fire hydrant","20 feet from a crosswalk","Blocking a driveway on private property","On the right side of a one-way street"], answer: 3 },
  // Safe Driving
  { id: 21, topic: "safety", difficulty: 1, question: "For drivers under 21, the legal BAC limit in most states is:", options: ["0.08%","0.04%","0.02% or lower (zero tolerance)","0.10%"], answer: 2 },
  { id: 22, topic: "safety", difficulty: 1, question: "Texting while driving at 55 mph is like driving how far with your eyes closed?", options: ["Half a block","A full football field","25 feet","One car length"], answer: 1 },
  { id: 23, topic: "safety", difficulty: 2, question: "A new teen driver's crash risk doubles when:", options: ["Driving at night","Driving with 1 teen passenger","Using GPS navigation","Driving on a highway"], answer: 1 },
  { id: 24, topic: "safety", difficulty: 2, question: "You're taking a cold medicine labeled 'may cause drowsiness.' You should:", options: ["Drive carefully","Only drive short distances","Not drive until the effects wear off","Drive with the window down for fresh air"], answer: 2 },
  { id: 25, topic: "safety", difficulty: 3, question: "Which is the BEST action if you feel drowsy while driving?", options: ["Roll down the windows","Turn up the radio","Drink coffee and push through","Pull over safely and rest"], answer: 3 },
];
