import { Request, Response } from "express";

// Check if PayPal credentials are available from Render environment variables
const hasPayPalCredentials = !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET;

console.log('🔧 PayPal Wrapper Init - Environment Check:', {
  hasClientId: !!process.env.PAYPAL_CLIENT_ID,
  hasSecret: !!process.env.PAYPAL_CLIENT_SECRET,
  clientIdLength: process.env.PAYPAL_CLIENT_ID?.length || 0,
  secretLength: process.env.PAYPAL_CLIENT_SECRET?.length || 0
});

let paypalModule: any = null;
let loadingPayPal: Promise<any> | null = null;

// Lazy load PayPal module - FORCE LOAD FROM ENVIRONMENT VARIABLES ONLY
async function ensurePayPalModule() {
  if (paypalModule) return paypalModule;
  
  // Force check environment variables (ignore database config)
  const forceEnvCheck = !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET;
  
  console.log('🔄 PayPal Module Load Attempt:', {
    hasPayPalCredentials: hasPayPalCredentials,
    forceEnvCheck: forceEnvCheck,
    clientId: process.env.PAYPAL_CLIENT_ID?.substring(0, 20) + '...',
    secretExists: !!process.env.PAYPAL_CLIENT_SECRET
  });
  
  if (!forceEnvCheck) {
    console.log('❌ PayPal: Missing environment variables from Render');
    return null;
  }
  
  if (!loadingPayPal) {
    console.log('🚀 PayPal: Loading module with environment variables...');
    loadingPayPal = import("./paypal").then(module => {
      paypalModule = module;
      console.log("✅ PayPal integration loaded successfully from environment variables");
      return module;
    }).catch(error => {
      console.error("❌ Failed to load PayPal module:", error);
      return null;
    });
  }
  
  return loadingPayPal;
}

// Export wrapper functions that check for credentials
export async function loadPaypalDefault(req: Request, res: Response) {
  const module = await ensurePayPalModule();
  if (!module) {
    return res.status(503).json({ 
      error: "PayPal payment processing is temporarily unavailable. Please use card payment or try again later." 
    });
  }
  return module.loadPaypalDefault(req, res);
}

export async function createPaypalOrder(req: Request, res: Response) {
  console.log('🔧 PayPal createOrder called - ENVIRONMENT VARIABLES ONLY MODE');
  console.log('PayPal Environment Check:', {
    hasClientId: !!process.env.PAYPAL_CLIENT_ID,
    hasSecret: !!process.env.PAYPAL_CLIENT_SECRET,
    clientIdLength: process.env.PAYPAL_CLIENT_ID?.length || 0,
    secretLength: process.env.PAYPAL_CLIENT_SECRET?.length || 0,
    requestBody: req.body
  });
  
  // FORCE: Use only environment variables, ignore database
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.log('❌ PayPal: Missing environment variables from Render Dashboard');
    return res.status(503).json({ 
      error: "PayPal not configured. Missing environment variables.",
      debug: {
        hasClientId: !!process.env.PAYPAL_CLIENT_ID,
        hasSecret: !!process.env.PAYPAL_CLIENT_SECRET,
        message: "Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to Render Dashboard Environment"
      }
    });
  }
  
  const module = await ensurePayPalModule();
  if (!module) {
    console.log('❌ PayPal module failed to load');
    return res.status(503).json({ 
      error: "PayPal module failed to load",
      debug: "Check server logs for import errors"
    });
  }
  
  console.log('✅ PayPal module loaded successfully, creating order...');
  return module.createPaypalOrder(req, res);
}

export async function capturePaypalOrder(req: Request, res: Response) {
  const module = await ensurePayPalModule();
  if (!module) {
    return res.status(503).json({ 
      error: "PayPal payment processing is temporarily unavailable. Please use card payment or try again later." 
    });
  }
  return module.capturePaypalOrder(req, res);
}
