import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, User, Wrench, Play, Camera, Zap, ExternalLink, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: number;
  sender: 'user' | 'mechanic';
  text: string;
  timestamp: string;
  imageUrl?: string;
}

// Helper function to render text with clickable YouTube links
const renderTextWithLinks = (text: string) => {
  const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+))/g;
  const parts = text.split(youtubeRegex);
  
  return parts.map((part, index) => {
    if (part.match(youtubeRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 underline font-medium"
        >
          🎥 Watch Tutorial
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    return part;
  });
};

export default function LiveChatPreview() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const chatExamples = [
    // Example 1: Headlight Wiring Diagram
    {
      mechanicName: "CarlosGarage - Auto Electrician",
      mechanicStatus: "Online • Electrical systems specialist, 16 years",
      messages: [
        {
          id: 1,
          sender: 'user' as const,
          text: "Installing aftermarket LED headlights on my 2020 F-150. Need wiring help - which wire is which? 💡",
          timestamp: "5:45 PM"
        },
        {
          id: 2,
          sender: 'mechanic' as const,
          text: "Carlos here, auto electrician for 16 years. LED conversion on F-150s is tricky! Wrong wiring can damage ECU. What LED kit are you using? I'll need the part number to send correct diagram.",
          timestamp: "5:45 PM"
        },
        {
          id: 3,
          sender: 'user' as const,
          text: "It's an Auxbeam LED kit, model H11-6000K. The instructions are terrible 😤",
          timestamp: "5:46 PM"
        },
        {
          id: 4,
          sender: 'mechanic' as const,
          text: "I know that kit! Common issue with their instructions. Let me pull up the factory wiring diagram for 2020 F-150 headlights. This will show you EXACTLY which wire goes where... 🔌",
          timestamp: "5:47 PM"
        },
        {
          id: 5,
          sender: 'mechanic' as const,
          text: "[📷 Image sent: Ford_F150_20_LED_headlight_wiring.jpg] ⚡ Here's the exact wiring: PURPLE/VIOLET = Low beam +12V, BLUE/RED = High beam +12V, BLACK = Ground. Note the BODY CONTROL MODULE connections - very important for CANBUS!",
          timestamp: "5:48 PM",
          imageUrl: "/api/uploads/file-1759338166036-139982218.jpg"
        },
        {
          id: 6,
          sender: 'user' as const,
          text: "Awesome! Do I need those resistors you mentioned? The kit didn't include any",
          timestamp: "5:50 PM"
        },
        {
          id: 7,
          sender: 'mechanic' as const,
          text: "YES! 2020 F-150 has CANBUS system that detects bulb failure. LEDs draw less power so truck thinks bulb is burned out. You need 50W 6Ω resistors on each headlight circuit. About $15 on Amazon, search 'LED load resistor H11' 🔧",
          timestamp: "5:51 PM"
        }
      ],
      savings: "proper wiring preventing $200+ ECU damage and error codes"
    },
    
    // Example 2: JCB 4CX Hydraulic BSP Adapters
    {
      mechanicName: "SteveMec2 - Heavy Equipment Tech",
      mechanicStatus: "Online • Heavy Machinery specialist, 18 years",
      messages: [
        {
          id: 1,
          sender: 'user' as const,
          text: "Working on JCB 4CX hydraulics. Need torque specs for BSP hose adaptors on loader circuit. Manual is unclear 🔧",
          timestamp: "2:30 PM"
        },
        {
          id: 2,
          sender: 'mechanic' as const,
          text: "Steve here, JCB specialist for 18 years. BSP hydraulic fittings are critical on 4CX! Wrong torque = blown seals or cracked housings. What size adaptors are you working with?",
          timestamp: "2:30 PM"
        },
        {
          id: 3,
          sender: 'user' as const,
          text: "Mix of 1/2\" and 3/4\" BSP on the loader lift cylinders. Previous mechanic overtightened some 😤",
          timestamp: "2:32 PM"
        },
        {
          id: 4,
          sender: 'mechanic' as const,
          text: "Ugh, classic mistake! BSP threads are parallel, not tapered - they seal on the face, not threads. Let me pull up the official JCB torque chart...",
          timestamp: "2:33 PM"
        },
        {
          id: 5,
          sender: 'mechanic' as const,
          text: "[📷 Image sent: JCB_4CX_hydraulic_torque_specifications.jpg] 🔧 1/2\" BSP = 45-55 Nm, 3/4\" BSP = 75-85 Nm. Use new O-rings, light hydraulic oil on threads. Torque to lower spec first, then check for leaks!",
          timestamp: "2:34 PM",
          imageUrl: "/api/uploads/file-1759348718678-560773015.jpg"
        },
        {
          id: 6,
          sender: 'user' as const,
          text: "Perfect! Should I use thread sealant on BSP fittings?",
          timestamp: "2:36 PM"
        },
        {
          id: 7,
          sender: 'mechanic' as const,
          text: "NO sealant on BSP! The O-ring does the sealing. Sealant can cause hydraulic contamination. Just clean threads, new O-ring, and proper torque. That's it! 💪",
          timestamp: "2:37 PM"
        }
      ],
      savings: "proper BSP fitting torque preventing $800+ hydraulic pump damage"
    },

    // Example 3: E-TEC V6 250HP Outboard Oil System
    {
      mechanicName: "Mike Boyd - Marine/Boat Mechanic",
      mechanicStatus: "Online • Outboard engine specialist, 13 years",
      messages: [
        {
          id: 1,
          sender: 'user' as const,
          text: "Working on Evinrude E-TEC G2 250HP V6 3.3L. Need oil supply diagram - losing oil pressure to cylinders 4-6 🛥️",
          timestamp: "10:15 AM"
        },
        {
          id: 2,
          sender: 'mechanic' as const,
          text: "Mike here, E-TEC specialist for 15 years. Oil pressure loss to specific cylinders usually means manifold blockage or failed EMM control. Let me pull up the oil system diagram for your 3.3L V6...",
          timestamp: "10:15 AM"
        },
        {
          id: 3,
          sender: 'user' as const,
          text: "Yes, that would be perfect! I suspect something in the rear oil manifold but want to confirm the oil flow path",
          timestamp: "10:16 AM"
        },
        {
          id: 4,
          sender: 'mechanic' as const,
          text: "Smart thinking! E-TEC oil system is complex. Sending you the complete oil supply diagram now...",
          timestamp: "10:17 AM"
        },
        {
          id: 5,
          sender: 'mechanic' as const,
          text: "[📷 Image sent: E-TEC_G2_250HP_oil_system_diagram.jpg] 🛠️ Here's the layout: REAR oil manifold delivers oil to cylinder slaves 1-6, PRIMARY manifold delivers to crankcase fittings and rear oil manifold. Check the EMM solenoids first!",
          timestamp: "10:18 AM",
          imageUrl: "/api/uploads/file-1759350468949-247584733.jpg"
        },
        {
          id: 6,
          sender: 'user' as const,
          text: "Perfect diagram! So if cylinders 4-6 aren't getting oil, I should check the rear manifold delivery lines?",
          timestamp: "10:20 AM"
        },
        {
          id: 7,
          sender: 'mechanic' as const,
          text: "Exactly! Also check EMM operation - it controls individual cylinder oil delivery. Use Evinrude diagnostic software to test EMM solenoid function. Could save you hours of teardown! 💪",
          timestamp: "10:21 AM"
        }
      ],
      savings: "EMM diagnostic preventing unnecessary $300+ manifold replacement"
    },

    // Example 4: BMW N54 Turbo Wastegate Actuator
    {
      mechanicName: "BMWTechPro - Diesel/Petrol Specialist",
      mechanicStatus: "Online • BMW/MINI specialist, 14 years",
      messages: [
        {
          id: 1,
          sender: 'user' as const,
          text: "2008 BMW 335i N54 throwing codes 30FF and 30FD. Car goes into limp mode under boost. Turbo issue? 🚗",
          timestamp: "3:15 PM"
        },
        {
          id: 2,
          sender: 'mechanic' as const,
          text: "Hans here, BMW specialist for 14 years. Those codes are classic N54 wastegate actuator failure! 30FF = Charge pressure control positive deviation, 30FD = negative deviation. Very common on 2007-2010 N54s.",
          timestamp: "3:15 PM"
        },
        {
          id: 3,
          sender: 'user' as const,
          text: "Ugh, exactly what I was afraid of. How can I confirm it's the actuators and not the turbos themselves?",
          timestamp: "3:16 PM"
        },
        {
          id: 4,
          sender: 'mechanic' as const,
          text: "Good question! First, let's do proper diagnosis with ISTA. Need to check wastegate position values vs. target. If actuators can't reach target position, that's your smoking gun. Much cheaper than new turbos!",
          timestamp: "3:17 PM"
        },
        {
          id: 5,
          sender: 'mechanic' as const,
          text: "Here's the complete diagnostic procedure: https://www.youtube.com/watch?v=EotGmcX1NiY\n\nCheck Block 1 & 2 wastegate position using ISTA - should track within 5% of target. If you see greater than 10% deviation, wastegate actuators are failing. This video shows the proper boost leak testing method. Don't just replace turbos without proper diagnosis!",
          timestamp: "3:18 PM"
        },
        {
          id: 6,
          sender: 'user' as const,
          text: "Perfect! I have ISTA access. What are typical position values I should see during test?",
          timestamp: "3:20 PM"
        },
        {
          id: 7,
          sender: 'mechanic' as const,
          text: "At idle: 0-5% wastegate position. Under load test: should ramp smoothly to 85-95% without hesitation. If it sticks, jumps, or can't reach target = bad actuator. Save yourself $1500on unnecessary turbo replacement! 💰",
          timestamp: "3:21 PM"
        }
      ],
      savings: "proper diagnosis preventing $1500+ unnecessary turbo replacement"
    }
  ];

  const currentExample = chatExamples[currentExampleIndex];
  const demoMessages = currentExample.messages;

  // Auto-start demo on component mount
  useEffect(() => {
    if (displayedMessages.length === 0 && currentMessageIndex === 0 && !isPlaying) {
      setTimeout(() => {
        setIsPlaying(true);
      }, 1000); // Start after 1 second delay
    }
  }, []);

  // Auto-scroll chat to bottom when new messages appear
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [displayedMessages]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      if (currentMessageIndex < demoMessages.length) {
        setDisplayedMessages(prev => [...prev, demoMessages[currentMessageIndex]]);
        setCurrentMessageIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        // Chat finished - don't auto-restart
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [isPlaying, currentMessageIndex, demoMessages.length, chatExamples.length]);

  const startDemo = () => {
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
    setIsPlaying(true);
  };

  const nextExample = () => {
    setCurrentExampleIndex(prev => (prev + 1) % chatExamples.length);
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
    setIsPlaying(true); // Start the new example immediately
  };

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See Our <span className="text-primary">Live Chat</span> in Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch how our expert mechanics solve real problems in real-time with professional diagnostics, 
              wiring diagrams, torque specifications, technical documentation, and step-by-step guidance.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Chat Demo */}
            <div className="order-2 lg:order-1">
              <Card className="max-w-md mx-auto shadow-xl">
                <CardHeader className="bg-primary text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-foreground text-primary">
                          <Wrench className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{currentExample.mechanicName}</div>
                        <div className="text-sm opacity-90">{currentExample.mechanicStatus}</div>
                        {isPlaying && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="h-1.5 w-1.5 bg-green-300 rounded-full animate-pulse" />
                            <span className="text-xs opacity-75">Demo Auto-Playing</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div ref={chatMessagesRef} className="h-80 overflow-y-auto p-4 space-y-3">
                    {displayedMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.text.includes('[Image sent:') || message.text.includes('[Video sent:') || message.text.includes('[📷 Image sent:') || message.text.includes('[🎥 Video sent:') ? (
                            <div className="space-y-2">
                              <div className={`flex items-center gap-2 p-2 rounded border ${
                                message.text.includes('wiring_diagram') ? 
                                'bg-yellow-50 border-yellow-200' : 
                                (message.text.includes('[🎥 Video sent:') || message.text.includes('[Video sent:')) ?
                                'bg-red-50 border-red-200' :
                                'bg-blue-50 border-blue-200'
                              }`}>
                                {message.text.includes('wiring_diagram') ? 
                                  <Zap className="h-4 w-4 text-yellow-600" /> :
                                  (message.text.includes('[🎥 Video sent:') || message.text.includes('[Video sent:')) ?
                                  <Play className="h-4 w-4 text-red-600" /> :
                                  <Camera className="h-4 w-4 text-blue-600" />
                                }
                                <span className={`text-xs font-medium ${
                                  message.text.includes('wiring_diagram') ? 
                                  'text-yellow-700' : 
                                  (message.text.includes('[🎥 Video sent:') || message.text.includes('[Video sent:')) ?
                                  'text-red-700' :
                                  'text-blue-700'
                                }`}>
                                  {message.imageUrl ? 
                                    message.imageUrl.split('/').pop() || 'Image' :
                                    (message.text.includes('[🎥 Video sent:') || message.text.includes('[Video sent:')) ?
                                    (message.text.match(/\[(?:🎥 )?Video sent: (.*?)\]/)?.[1] || 'Video Tutorial') :
                                    (message.text.match(/\[(?:📷 )?Image sent: (.*?)\]/)?.[1] || 'Image')
                                  }
                                </span>
                              </div>
                              {message.imageUrl && (
                                <div className="mt-2">
                                  <img 
                                    src={message.imageUrl} 
                                    alt="Technical diagram"
                                    className="max-w-full h-auto rounded border shadow-sm"
                                    style={{ maxHeight: '200px' }}
                                  />
                                </div>
                              )}
                              <div className="text-sm">
                                {renderTextWithLinks(message.text.replace(/\[(?:📷 )?(?:Image sent:|🎥 )?(?:Video sent:).*?\]\s*/, ''))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">{message.text}</div>
                          )}
                          <div className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {!isPlaying && displayedMessages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Live demo starting automatically...</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <div className="flex-1 p-2 border rounded bg-muted/30 text-sm text-muted-foreground">
                        Type your automotive question...
                      </div>
                      <Button size="sm" disabled>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  Real Conversations, Real Solutions
                </h3>
                <p className="text-muted-foreground">
                  This is exactly how our platform works. Connect with certified mechanics 
                  who provide step-by-step guidance for any automotive problem.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <div className="h-2 w-2 bg-green-600 rounded-full" />
                  </div>
                  <div>
                    <div className="font-semibold">Instant Connection</div>
                    <div className="text-sm text-muted-foreground">
                      Connect with available mechanics in under 30 seconds
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                    <div className="h-2 w-2 bg-blue-600 rounded-full" />
                  </div>
                  <div>
                    <div className="font-semibold">Expert Diagnosis</div>
                    <div className="text-sm text-muted-foreground">
                      ASE certified mechanics with years of experience
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                    <div className="h-2 w-2 bg-purple-600 rounded-full" />
                  </div>
                  <div>
                    <div className="font-semibold">Step-by-Step Guidance</div>
                    <div className="text-sm text-muted-foreground">
                      Clear instructions you can follow immediately
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  variant="default" 
                  onClick={nextExample} 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                  Next Example
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const section = document.getElementById('vehicle-selector-section');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  Start Live Chat
                </Button>
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  💰 Potential savings from this chat
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {currentExample.savings}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}