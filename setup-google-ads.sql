-- Google Ads Configuration Setup
-- Inserts conversion tracking configuration with ID: AW-17646488974

-- Delete existing configuration (if any)
DELETE FROM google_ads_config;

-- Insert new Google Ads configuration
INSERT INTO google_ads_config (
  conversion_id,
  purchase_label,
  signup_label,
  enabled,
  updated_at
) VALUES (
  'AW-17646488974',
  'purchase_conversion',
  NULL, -- Signup tracking not needed since registration only happens after purchase
  true,
  NOW()
);

-- Verify the configuration
SELECT * FROM google_ads_config;

-- Show confirmation
SELECT 
  'Google Ads Configuration Complete!' as status,
  conversion_id as "Conversion ID",
  purchase_label as "Purchase Label",
  signup_label as "Signup Label",
  enabled as "Enabled",
  updated_at as "Updated At"
FROM google_ads_config;