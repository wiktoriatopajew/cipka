import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle, XCircle, Settings, Save, Loader2, Eye, EyeOff, Key, Mail, CreditCard, Shield, Image, Upload } from 'lucide-react';

interface AppConfig {
  id: number;
  appName: string;
  appUrl: string;
  // Stripe
  stripePublishableKey: string;
  stripeSecretKey: string;
  // PayPal
  paypalClientId: string;
  paypalClientSecret: string;
  paypalWebhookId: string;
  paypalMode: 'sandbox' | 'live';
  // SMTP
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  emailFrom: string;
  emailFromName: string;
  // General
  supportEmail: string;
  faviconPath?: string;
}

interface SaveResult {
  success: boolean;
  message: string;
}

export default function AppConfigPanel() {
  const [config, setConfig] = useState<AppConfig>({
    id: 1,
    appName: 'AutoMentor',
    appUrl: 'http://localhost:5000',
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalClientSecret: '',
    paypalWebhookId: '',
    paypalMode: 'sandbox',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: true,
    smtpUser: '',
    smtpPass: '',
    emailFrom: '',
    emailFromName: 'AutoMentor',
    supportEmail: '',
    faviconPath: ''
  });

  const [showSecrets, setShowSecrets] = useState({
    stripeSecret: false,
    paypalSecret: false,
    paypalWebhook: false,
    smtpPass: false
  });

  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<SaveResult | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [faviconUploadResult, setFaviconUploadResult] = useState<SaveResult | null>(null);

  const queryClient = useQueryClient();

  // Fetch current configuration
  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ['appConfig'],
    queryFn: async (): Promise<AppConfig> => {
      const response = await fetch('/api/admin/app-config', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch app configuration');
      }
      return await response.json();
    }
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: AppConfig) => {
      const response = await fetch('/api/admin/app-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newConfig)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update app configuration');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appConfig'] });
      setIsChanged(false);
      setSaveResult({ success: true, message: 'Configuration saved successfully!' });
      setTimeout(() => setSaveResult(null), 5000);
    },
    onError: (error) => {
      setSaveResult({ success: false, message: `Failed to save: ${error.message}` });
      setTimeout(() => setSaveResult(null), 5000);
    }
  });

  // SMTP Test mutation
  const testSmtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/admin/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ testEmail: email })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'SMTP test failed');
      }
      
      return result;
    },
    onSuccess: (data) => {
      setSmtpTestResult({ success: true, message: data.message });
      setTimeout(() => setSmtpTestResult(null), 8000);
    },
    onError: (error) => {
      setSmtpTestResult({ success: false, message: error.message });
      setTimeout(() => setSmtpTestResult(null), 8000);
    }
  });

  // Update local state when data is loaded
  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
      setIsChanged(false);
    }
  }, [currentConfig]);

  const handleConfigChange = (field: keyof AppConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setIsChanged(true);
    setSaveResult(null);
  };

  const handleSave = () => {
    updateConfigMutation.mutate(config);
  };

  const toggleSecretVisibility = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTestSmtp = () => {
    if (!testEmail.trim()) {
      setSmtpTestResult({ success: false, message: 'Please enter a test email address' });
      setTimeout(() => setSmtpTestResult(null), 5000);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      setSmtpTestResult({ success: false, message: 'Please enter a valid email address' });
      setTimeout(() => setSmtpTestResult(null), 5000);
      return;
    }

    testSmtpMutation.mutate(testEmail);
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setFaviconUploadResult({ 
        success: false, 
        message: 'Please select a valid favicon file (.ico, .png, .jpg, .gif)' 
      });
      setTimeout(() => setFaviconUploadResult(null), 5000);
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setFaviconUploadResult({ 
        success: false, 
        message: 'Favicon file size must be less than 1MB' 
      });
      setTimeout(() => setFaviconUploadResult(null), 5000);
      return;
    }

    try {
      setFaviconUploading(true);
      setFaviconUploadResult(null);

      const formData = new FormData();
      formData.append('favicon', file);

      const response = await fetch('/api/admin/upload-favicon', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Favicon upload failed');
      }

      // Update config with new favicon path and save automatically
      const updatedConfig = { ...config, faviconPath: result.faviconPath };
      setConfig(updatedConfig);
      
      // Auto-save the configuration with new favicon path
      const saveResponse = await fetch('/api/admin/app-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedConfig)
      });
      
      if (!saveResponse.ok) {
        throw new Error('Failed to save favicon configuration');
      }
      
      // Refresh the config from server
      queryClient.invalidateQueries({ queryKey: ['appConfig'] });
      
      setIsChanged(false);
      setFaviconUploadResult({ 
        success: true, 
        message: `Favicon uploaded and saved successfully!` 
      });
      setTimeout(() => setFaviconUploadResult(null), 8000);

    } catch (error: any) {
      setFaviconUploadResult({ 
        success: false, 
        message: error.message || 'Favicon upload failed' 
      });
      setTimeout(() => setFaviconUploadResult(null), 5000);
    } finally {
      setFaviconUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Configuration
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
          App Configuration
        </CardTitle>
        <CardDescription>
          Configure payment providers, email settings, and general app settings. 
          All sensitive keys are stored securely.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="stripe">
              <CreditCard className="h-4 w-4 mr-2" />
              Stripe
            </TabsTrigger>
            <TabsTrigger value="paypal">
              <Shield className="h-4 w-4 mr-2" />
              PayPal
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name</Label>
                <Input
                  id="appName"
                  value={config.appName}
                  onChange={(e) => handleConfigChange('appName', e.target.value)}
                  placeholder="AutoMentor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appUrl">App URL</Label>
                <Input
                  id="appUrl"
                  value={config.appUrl}
                  onChange={(e) => handleConfigChange('appUrl', e.target.value)}
                  placeholder="https://yourapp.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={config.supportEmail}
                  onChange={(e) => handleConfigChange('supportEmail', e.target.value)}
                  placeholder="support@yourapp.com"
                />
              </div>
            </div>

            {/* Favicon Upload Section */}
            <div className="border-t pt-4 mt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Website Favicon
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload a favicon for your website. Supported formats: .ico, .png, .jpg, .gif (max 1MB)
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Current Favicon Preview */}
                  {config.faviconPath && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={`/api/uploads/${config.faviconPath}`} 
                        alt="Current favicon" 
                        className="w-8 h-8"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Current favicon</p>
                        <p className="text-xs text-muted-foreground">{config.faviconPath}</p>
                      </div>
                    </div>
                  )}

                  {/* Upload Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".ico,.png,.jpg,.jpeg,.gif,image/x-icon,image/vnd.microsoft.icon,image/png,image/jpeg,image/gif"
                      onChange={handleFaviconUpload}
                      disabled={faviconUploading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={faviconUploading}
                      className="whitespace-nowrap"
                      onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                    >
                      {faviconUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Upload Result */}
                  {faviconUploadResult && (
                    <Alert variant={faviconUploadResult.success ? "default" : "destructive"}>
                      <div className="flex items-center gap-2">
                        {faviconUploadResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{faviconUploadResult.message}</AlertDescription>
                      </div>
                    </Alert>
                  )}

                  <div className="text-xs text-muted-foreground">
                    💡 Tip: For best results, use a 32x32 pixel .ico file or a square PNG image.
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Stripe Settings */}
          <TabsContent value="stripe" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripePublishableKey">
                  Publishable Key
                  <span className="text-muted-foreground ml-2">(Safe to expose)</span>
                </Label>
                <Input
                  id="stripePublishableKey"
                  value={config.stripePublishableKey}
                  onChange={(e) => handleConfigChange('stripePublishableKey', e.target.value)}
                  placeholder="pk_test_..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeSecretKey">
                  Secret Key
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="stripeSecretKey"
                    type={showSecrets.stripeSecret ? "text" : "password"}
                    value={config.stripeSecretKey}
                    onChange={(e) => handleConfigChange('stripeSecretKey', e.target.value)}
                    placeholder="sk_test_..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => toggleSecretVisibility('stripeSecret')}
                  >
                    {showSecrets.stripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* PayPal Settings */}
          <TabsContent value="paypal" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paypalMode">Environment</Label>
                <Select
                  value={config.paypalMode}
                  onValueChange={(value: 'sandbox' | 'live') => handleConfigChange('paypalMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                    <SelectItem value="live">Live (Production)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypalClientId">Client ID</Label>
                <Input
                  id="paypalClientId"
                  value={config.paypalClientId}
                  onChange={(e) => handleConfigChange('paypalClientId', e.target.value)}
                  placeholder="AXxxx..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypalClientSecret">
                  Client Secret
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="paypalClientSecret"
                    type={showSecrets.paypalSecret ? "text" : "password"}
                    value={config.paypalClientSecret}
                    onChange={(e) => handleConfigChange('paypalClientSecret', e.target.value)}
                    placeholder="ELxxx..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => toggleSecretVisibility('paypalSecret')}
                  >
                    {showSecrets.paypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypalWebhookId">Webhook ID</Label>
                <div className="relative">
                  <Input
                    id="paypalWebhookId"
                    type={showSecrets.paypalWebhook ? "text" : "password"}
                    value={config.paypalWebhookId}
                    onChange={(e) => handleConfigChange('paypalWebhookId', e.target.value)}
                    placeholder="WH-xxx..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => toggleSecretVisibility('paypalWebhook')}
                  >
                    {showSecrets.paypalWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={config.smtpHost}
                    onChange={(e) => handleConfigChange('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={config.smtpPort}
                    onChange={(e) => handleConfigChange('smtpPort', parseInt(e.target.value) || 587)}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtpSecure"
                  checked={config.smtpSecure}
                  onCheckedChange={(checked) => handleConfigChange('smtpSecure', checked)}
                />
                <Label htmlFor="smtpSecure">Use TLS/SSL</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={config.smtpUser}
                  onChange={(e) => handleConfigChange('smtpUser', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPass">
                  SMTP Password
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="smtpPass"
                    type={showSecrets.smtpPass ? "text" : "password"}
                    value={config.smtpPass}
                    onChange={(e) => handleConfigChange('smtpPass', e.target.value)}
                    placeholder="Your app password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => toggleSecretVisibility('smtpPass')}
                  >
                    {showSecrets.smtpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailFrom">From Email</Label>
                  <Input
                    id="emailFrom"
                    type="email"
                    value={config.emailFrom}
                    onChange={(e) => handleConfigChange('emailFrom', e.target.value)}
                    placeholder="noreply@yourapp.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailFromName">From Name</Label>
                  <Input
                    id="emailFromName"
                    value={config.emailFromName}
                    onChange={(e) => handleConfigChange('emailFromName', e.target.value)}
                    placeholder="AutoMentor"
                  />
                </div>
              </div>

              {/* SMTP Test Section */}
              <div className="border-t pt-4 mt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Test SMTP Configuration
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Send a test email to verify your SMTP configuration is working correctly.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter test email address"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleTestSmtp}
                      disabled={testSmtpMutation.isPending || !config.smtpHost || !config.smtpUser || !config.smtpPass}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      {testSmtpMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Test
                        </>
                      )}
                    </Button>
                  </div>

                  {/* SMTP Test Result */}
                  {smtpTestResult && (
                    <Alert variant={smtpTestResult.success ? "default" : "destructive"}>
                      <div className="flex items-center gap-2">
                        {smtpTestResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{smtpTestResult.message}</AlertDescription>
                      </div>
                    </Alert>
                  )}

                  {(!config.smtpHost || !config.smtpUser || !config.smtpPass) && (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                      ⚠️ Complete SMTP configuration first (Host, Username, Password) before testing.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Result */}
        {saveResult && (
          <Alert variant={saveResult.success ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {saveResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{saveResult.message}</AlertDescription>
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
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
            <Key className="h-4 w-4" />
            Security Notice
          </h4>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>All sensitive keys are encrypted and stored securely in the database</li>
            <li>Never share your secret keys or passwords with anyone</li>
            <li>Use environment-specific keys (sandbox for testing, live for production)</li>
            <li>Regularly rotate your API keys and passwords</li>
            <li>For Gmail SMTP, use App Passwords instead of your regular password</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}