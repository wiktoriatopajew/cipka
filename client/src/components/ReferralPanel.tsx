import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Users, Gift, Share2, CheckCircle, ExternalLink, Clipboard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  currentCycle: number;
  canResetCycle: boolean;
  completedCycles: number;
  referralsList: Array<{
    id: string;
    username: string;
    createdAt: string;
  }>;
  rewardProgress: {
    current: number;
    required: number;
    nextReward: string;
  };
  rewards: Array<{
    id: string;
    type: string;
    value: number;
    status: string;
    cycle: number;
    currentReferrals: number;
    awardedAt: string | null;
  }>;
}

interface ReferralPanelProps {
  onChoosePlan?: () => void;
}

export default function ReferralPanel({ onChoosePlan }: ReferralPanelProps = {}) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const { toast } = useToast();

  // Check user subscription status
  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const hasAccess = (user as any)?.hasSubscription || false;

  const { data: referralData, isLoading, error } = useQuery<ReferralData>({
    queryKey: ['/api/users/referrals'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users/referrals");
      return response.json();
    }
  });

  const copyReferralCode = async () => {
    if (referralData?.referralCode) {
      try {
        await navigator.clipboard.writeText(referralData.referralCode);
        setCopied(true);
        toast({
          title: "Code Copied!",
          description: "Referral code has been copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Copy Error",
          description: "Failed to copy code",
          variant: "destructive",
        });
      }
    }
  };

  const copyReferralUrl = async () => {
    if (referralData?.referralCode) {
      const url = `${window.location.origin}?ref=${referralData.referralCode}&payment=true`;
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Purchase Link Copied!",
          description: "Direct link to payment - friends can buy instantly!",
        });
      } catch (err) {
        toast({
          title: "Copy Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      }
    }
  };

  const resetReferralCycle = async () => {
    try {
      const response = await apiRequest("POST", "/api/users/reset-referral-cycle");
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Cycle Reset!",
          description: result.message,
        });
        // Refresh referral data
        window.location.reload();
      } else {
        toast({
          title: "Reset Failed",
          description: result.error || "Failed to reset cycle",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Reset Error",
        description: "Failed to reset referral cycle",
        variant: "destructive",
      });
    }
  };

  const shareOnFacebook = () => {
    if (referralData?.referralCode) {
      // Check if on mobile - use native share
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const url = `${window.location.origin}?ref=${referralData.referralCode}&payment=true`;
      const text = `🚗 Need car help? I found an amazing platform where you can chat with certified automotive mechanics instantly! 💬

✅ Expert advice from real mechanics
✅ Quick solutions for any car problem  
✅ Available 24/7
✅ Much cheaper than garage visits

Use my referral link and get 10% OFF your first subscription + 30 days free access! 🎁💰

Click here to choose your plan and get started:
${url}

Stop guessing about car problems - get professional help now! 🔧`;

      if (isMobile && navigator.share) {
        // Mobile - use native share
        navigator.share({
          title: 'Chat with Automotive Mechanics',
          text: text,
          url: url
        }).catch(() => {
          // Fallback to our modal
          setShowFacebookModal(true);
        });
      } else {
        // Desktop - show our custom Facebook modal
        setShowFacebookModal(true);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading referral data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !referralData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading referral data
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = (referralData.rewardProgress.current / referralData.rewardProgress.required) * 100;

  return (
    <div className="space-y-6">
      {/* Info for users without active subscription */}
      {!hasAccess && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Gift className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Or Earn Free Access Through Referrals!
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                  Don't want to pay? You can still earn free access by referring friends! 
                  Your friends get 10% OFF their first subscription, and when 3 people register 
                  with your referral code and purchase a subscription, you'll automatically get 30 days of free access.
                </p>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  💡 Share your code below to start earning rewards
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={referralData.referralCode}
              readOnly
              className="font-mono text-lg font-bold"
            />
            <Button
              onClick={copyReferralCode}
              variant="outline"
              size="icon"
              className={copied ? "text-green-600" : ""}
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Share this code with friends. They get 10% OFF their first subscription,
            and when 3 people register with your code and purchase a subscription, you'll get 30 days of free access!
          </div>

          <div className="flex gap-2">
            <Button onClick={copyReferralUrl} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
                                      Copy Link
            </Button>
            <Button onClick={shareOnFacebook} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
                                      Share on Facebook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{referralData.totalReferrals}</div>
                <div className="text-sm text-muted-foreground">Total Referrals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{referralData.activeReferrals}</div>
                <div className="text-sm text-muted-foreground">Active Subscriptions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {referralData.rewardProgress.current}/{referralData.rewardProgress.required}
                </div>
                <div className="text-sm text-muted-foreground">To Reward</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reward Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Reward Progress - Cycle {referralData.currentCycle}
          </CardTitle>
          {referralData.completedCycles > 0 && (
            <p className="text-sm text-muted-foreground">
              🎉 Completed cycles: {referralData.completedCycles} | Earned: {referralData.completedCycles * 30} days total
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Current cycle referrals: {referralData.rewardProgress.current}</span>
              <span>Goal: {referralData.rewardProgress.required}</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            
            <div className="text-center space-y-2">
              {referralData.rewardProgress.current >= referralData.rewardProgress.required ? (
                <Badge variant="default" className="bg-green-500">
                  🎉 Reward earned! Check your subscription
                </Badge>
              ) : (
                <Badge variant="secondary">
                  {referralData.rewardProgress.required - referralData.rewardProgress.current} more referrals needed for reward
                </Badge>
              )}
              
              {referralData.canResetCycle && (
                <div className="pt-2">
                  <Button 
                    onClick={resetReferralCycle}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    🔄 Start New Cycle
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start referring 3 more people for another 30 days!
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List of referred users */}
      {referralData.referralsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referred Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referralData.referralsList.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{referral.username}</div>
                    <div className="text-sm text-muted-foreground">
                      Joined: {new Date(referral.createdAt).toLocaleDateString('en-US')}
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rewards History */}
      {referralData.rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rewards History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referralData.rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      Cycle {reward.cycle}: {reward.type === "free_month" ? "30 days free access" : reward.type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Referrals: {reward.currentReferrals || 0}/3
                    </div>
                    {reward.awardedAt && (
                      <div className="text-sm text-muted-foreground">
                        Awarded: {new Date(reward.awardedAt).toLocaleDateString('en-US')}
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant={reward.status === "awarded" ? "default" : "secondary"}
                    className={reward.status === "awarded" ? "bg-green-500" : ""}
                  >
                    {reward.status === "awarded" ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Facebook Share Instructions Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Ready to Share on Facebook!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-400">Message Copied Successfully!</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your referral message has been copied to clipboard.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Next Steps:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  <span>Facebook will open in a new tab</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  <span>Look for the "What's on your mind?" box at the top of your feed</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  <span>Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">Ctrl+V</kbd> to paste your message</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                  <span>Click "Post" to share with your friends!</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  const text = `🚗 Need car help? I found an amazing platform where you can chat with certified automotive mechanics instantly! 💬

✅ Expert advice from real mechanics
✅ Quick solutions for any car problem  
✅ Available 24/7
✅ Much cheaper than garage visits

Use my referral link and get 10% OFF your first subscription + 30 days free access! 🎁💰

${window.location.origin}?ref=${referralData?.referralCode}&payment=true

Stop guessing about car problems - get professional help now! 🔧`;
                  
                  // Try native sharing first
                  if (navigator.share) {
                    navigator.share({
                      title: 'Chat with Automotive Mechanics',
                      text: text
                    }).then(() => {
                      setShowShareModal(false);
                    });
                  } else {
                    // Copy and open Facebook
                    navigator.clipboard.writeText(text);
                    window.open('https://www.facebook.com/', '_blank');
                    setShowShareModal(false);
                  }
                }}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Facebook
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowShareModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Facebook Post Creator Modal */}
      <Dialog open={showFacebookModal} onOpenChange={setShowFacebookModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Share2 className="h-4 w-4 text-white" />
              </div>
              Create Facebook Post
            </DialogTitle>
          </DialogHeader>
          <FacebookPostCreator 
            referralCode={referralData?.referralCode} 
            onClose={() => setShowFacebookModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FacebookPostCreator({ referralCode, onClose }: { referralCode?: string, onClose: () => void }) {
  const { toast } = useToast();
  const url = `${window.location.origin}?ref=${referralCode}&payment=true`;
  const defaultText = `🚗 Need car help? I found an amazing platform where you can chat with certified automotive mechanics instantly! 💬

✅ Expert advice from real mechanics
✅ Quick solutions for any car problem  
✅ Available 24/7
✅ Much cheaper than garage visits

Use my referral link and get 10% OFF your first subscription + 30 days free access! 🎁💰

Click here to choose your plan and get started:
${url}

Stop guessing about car problems - get professional help now! 🔧`;

  const [postText, setPostText] = useState(defaultText);

  const copyAndOpenFacebook = () => {
    navigator.clipboard.writeText(postText).then(() => {
      toast({
        title: "✅ Text copied!",
        description: "Facebook post creator is opening - paste your message!",
        duration: 4000,
      });
      
      // Detect if user is on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile: try Facebook app intent first, then mobile web
        const fbAppIntent = `intent://share?text=${encodeURIComponent(postText)}#Intent;package=com.facebook.katana;scheme=fb;end`;
        const mobileComposer = 'https://m.facebook.com/composer/';
        
        try {
          window.location.href = fbAppIntent;
          // Fallback to mobile web after delay
          setTimeout(() => {
            window.open(mobileComposer, '_blank');
          }, 2000);
        } catch {
          window.open(mobileComposer, '_blank');
        }
      } else {
        // Desktop: Simple approach - open Facebook homepage and give clear instructions
        window.open('https://www.facebook.com/', '_blank');
        
        // Show detailed instructions
        setTimeout(() => {
          toast({
            title: "✅ Facebook opened!",
            description: "1. Find 'What's on your mind?' at top 2. Click the field 3. Paste (Ctrl+V) 4. Click 'Post'",
            duration: 10000,
          });
        }, 1000);
      }
      
      onClose();
    }).catch(() => {
      toast({
        title: "❌ Copy failed",
        description: "Please copy the text manually.",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Facebook Post:</label>
        <Textarea 
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Edit your referral message..."
          className="min-h-[120px] text-sm resize-none"
        />
        <p className="text-xs text-muted-foreground">
          You can edit this message before posting to Facebook
        </p>
      </div>
      
      <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-400">Ready to Post!</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Text will be copied and Facebook will open in new tab
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">📝 Instructions:</div>
            <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
              <div>1. Find "What's on your mind?" field at the top</div>
              <div>2. Click in that field</div>
              <div>3. Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+V</kbd> to paste</div>
              <div>4. Click "Post" button</div>
            </div>
          </div>
          
        <div className="flex gap-2">
          <Button onClick={copyAndOpenFacebook} className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copy & Open Facebook
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              navigator.clipboard.writeText(postText);
              toast({
                title: "✅ Text copied!",
                description: "Now: 1. Go to Facebook 2. Find 'What's on your mind?' 3. Paste (Ctrl+V) 4. Post",
                duration: 10000,
              });
            }}
          >
            Just Copy
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}