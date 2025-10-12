-- Update Google Ads conversion label with real value
-- Conversion Label: 32fyCMne66sbEI6bwN5B

-- First, check current configuration
SELECT * FROM google_ads_config;

-- Update with real conversion label
UPDATE google_ads_config SET 
  conversion_id = 'AW-17646488974',
  purchase_label = '32fyCMne66sbEI6bwN5B',
  signup_label = NULL,
  enabled = true,
  updated_at = NOW()
WHERE id = 1;

-- If no record exists, insert new one
INSERT INTO google_ads_config (conversion_id, purchase_label, signup_label, enabled, updated_at)
SELECT 'AW-17646488974', '32fyCMne66sbEI6bwN5B', NULL, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM google_ads_config WHERE id = 1);

-- Verify the update
SELECT 
  'Google Ads Configuration Updated!' as status,
  conversion_id as "Conversion ID",
  purchase_label as "Purchase Label", 
  enabled as "Enabled",
  updated_at as "Updated At"
FROM google_ads_config;

-- Show the complete conversion string
SELECT 
  CONCAT(conversion_id, '/', purchase_label) as "Complete Conversion String"
FROM google_ads_config
WHERE enabled = true;