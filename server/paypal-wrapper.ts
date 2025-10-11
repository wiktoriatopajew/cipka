import { Request, Response } from "express";

// Check if PayPal credentials are available
const hasPayPalCredentials = !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET;

let paypalModule: any = null;
let loadingPayPal: Promise<any> | null = null;

// Lazy load PayPal module
async function ensurePayPalModule() {
  if (paypalModule) return paypalModule;
  if (!hasPayPalCredentials) return null;
  
  if (!loadingPayPal) {
    loadingPayPal = import("./paypal").then(module => {
      paypalModule = module;
      console.log("PayPal integration loaded successfully");
      return module;
    }).catch(error => {
      console.error("Failed to load PayPal module:", error);
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
  console.log('🔧 PayPal createOrder called - checking credentials...');
  console.log('PayPal credentials check:', {
    hasClientId: !!process.env.PAYPAL_CLIENT_ID,
    hasSecret: !!process.env.PAYPAL_CLIENT_SECRET,
    clientIdLength: process.env.PAYPAL_CLIENT_ID?.length || 0
  });
  
  const module = await ensurePayPalModule();
  if (!module) {
    console.log('❌ PayPal module not loaded - missing credentials');
    return res.status(503).json({ 
      error: "PayPal payment processing is temporarily unavailable. Please use card payment or try again later.",
      debug: {
        hasClientId: !!process.env.PAYPAL_CLIENT_ID,
        hasSecret: !!process.env.PAYPAL_CLIENT_SECRET
      }
    });
  }
  
  console.log('✅ PayPal module loaded, calling createPaypalOrder...');
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
