import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Settings, Play, Save, Loader2 } from 'lucide-react';
import { GoogleAdsConversions } from '../lib/googleAdsTracking';

interface GoogleAdsConfig {
  enabled: boolean;
  conversionId: string;
  purchaseLabel: string;
  signupLabel: string;
}

interface TestResult {
  success: boolean;
  message: string;
}

export default function GoogleAdsPanel() {
  const [config, setConfig] = useState<GoogleAdsConfig>({
    enabled: false,
    conversionId: '',
    purchaseLabel: '',
    signupLabel: ''
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isChanged, setIsChanged] = useState(false);

  const queryClient = useQueryClient();

  // Fetch current configuration
  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ['googleAdsConfig'],
    queryFn: async (): Promise<GoogleAdsConfig> => {
      const response = await fetch('/api/admin/google-ads-config', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch Google Ads configuration');
      }
      return await response.json();
    }
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: GoogleAdsConfig) => {
      const response = await fetch('/api/admin/google-ads-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newConfig)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update Google Ads configuration');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['googleAdsConfig'] });
      setIsChanged(false);
      setTestResult({ success: true, message: 'Configuration saved successfully!' });
    },
    onError: (error) => {
      setTestResult({ success: false, message: `Failed to save: ${error.message}` });
    }
  });

  // Test tracking mutation
  const testTrackingMutation = useMutation({
    mutationFn: async () => {
      return await GoogleAdsConversions.testTracking();
    },
    onSuccess: (result) => {
      setTestResult(result);
    },
    onError: () => {
      setTestResult({ success: false, message: 'Test failed to execute' });
    }
  });

  // Update local state when data is loaded
  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
      setIsChanged(false);
    }
  }, [currentConfig]);

  const handleConfigChange = (field: keyof GoogleAdsConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setIsChanged(true);
    setTestResult(null);
  };

  const handleSave = () => {
    updateConfigMutation.mutate(config);
  };

  const handleTest = () => {
    testTrackingMutation.mutate();
  };

  const isValidConfig = config.enabled && 
    config.conversionId.trim() && 
    config.purchaseLabel.trim() && 
    config.signupLabel.trim();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Google Ads Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Google Ads Configuration
        </CardTitle>
        <CardDescription>
          Configure Google Ads conversion tracking for purchase and signup events. 
          Make sure to add the Google Tag Manager script to your website.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enabled">Enable Google Ads Tracking</Label>
            <div className="text-sm text-muted-foreground">
              Turn on/off all Google Ads conversion tracking
            </div>
          </div>
          <Switch
            id="enabled"
            checked={config.enabled}
            onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
          />
        </div>

        {/* Configuration Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conversionId">
              Google Ads Conversion ID
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="conversionId"
              placeholder="AW-1234567890"
              value={config.conversionId}
              onChange={(e) => handleConfigChange('conversionId', e.target.value)}
              disabled={!config.enabled}
              className={!config.enabled ? 'opacity-50' : ''}
            />
            <div className="text-sm text-muted-foreground">
              Find this in Google Ads → Tools & Settings → Conversions
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseLabel">
              Purchase Conversion Label
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="purchaseLabel"
              placeholder="AbC-D3fGhIjKlMnOp"
              value={config.purchaseLabel}
              onChange={(e) => handleConfigChange('purchaseLabel', e.target.value)}
              disabled={!config.enabled}
              className={!config.enabled ? 'opacity-50' : ''}
            />
            <div className="text-sm text-muted-foreground">
              Label for tracking successful purchases/subscriptions
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signupLabel">
              Signup Conversion Label
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="signupLabel"
              placeholder="XyZ-A1bCdEfGhIjKl"
              value={config.signupLabel}
              onChange={(e) => handleConfigChange('signupLabel', e.target.value)}
              disabled={!config.enabled}
              className={!config.enabled ? 'opacity-50' : ''}
            />
            <div className="text-sm text-muted-foreground">
              Label for tracking user registrations
            </div>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </div>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={!isChanged || updateConfigMutation.isPending}
            className="flex items-center gap-2"
          >
            {updateConfigMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Configuration
          </Button>

          <Button
            variant="outline"
            onClick={handleTest}
            disabled={!isValidConfig || testTrackingMutation.isPending}
            className="flex items-center gap-2"
          >
            {testTrackingMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Test Tracking
          </Button>
        </div>

        {/* Setup Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Create conversion actions in Google Ads</li>
            <li>Copy the Conversion ID (starts with "AW-")</li>
            <li>Copy the conversion labels for purchase and signup events</li>
            <li>Paste them in the fields above and enable tracking</li>
            <li>Use the "Test Tracking" button to verify everything works</li>
          </ol>
        </div>

        {/* Current Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className="font-medium">Status:</div>
          {config.enabled && isValidConfig ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Active and configured
            </div>
          ) : config.enabled && !isValidConfig ? (
            <div className="flex items-center gap-1 text-yellow-600">
              <XCircle className="h-4 w-4" />
              Enabled but incomplete configuration
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-600">
              <XCircle className="h-4 w-4" />
              Disabled
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}