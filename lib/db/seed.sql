-- Add more products
INSERT INTO products (name, category, price, image, description, features, stock, rating) VALUES
-- Software Development Category
('Enterprise ERP Solution', 'Software Development', 2499.99, '/images/products/erp-solution.jpg', 'Comprehensive enterprise resource planning solution for large businesses', ARRAY['Modular architecture', 'Real-time analytics', 'Multi-branch support', 'Customizable workflows', 'API integration'], 5, 4.8),
('Mobile App Development Kit', 'Software Development', 899.99, '/images/products/mobile-dev-kit.jpg', 'Complete toolkit for developing cross-platform mobile applications', ARRAY['iOS & Android support', 'UI component library', 'Push notification system', 'Analytics integration', 'Offline capability'], 15, 4.7),

-- Security Products Category
('Advanced Firewall System', 'Security Products', 1299.99, '/images/products/firewall-system.jpg', 'Next-generation firewall with advanced threat protection', ARRAY['Deep packet inspection', 'Intrusion prevention', 'VPN support', 'Real-time monitoring', 'Cloud integration'], 8, 4.9),
('Biometric Access Control', 'Security Products', 799.99, '/images/products/biometric-access.jpg', 'Multi-factor biometric authentication system for secure access control', ARRAY['Fingerprint scanning', 'Facial recognition', 'Mobile app integration', 'Audit logging', 'Time attendance tracking'], 12, 4.6),

-- IT Products Category
('Server Rack Bundle', 'IT Products', 3499.99, '/images/products/server-rack.jpg', 'Complete server rack solution with networking equipment', ARRAY['42U rack cabinet', 'PDU included', 'Cable management', 'Cooling system', 'Installation service'], 3, 4.8),
('Workstation Setup Package', 'IT Products', 1599.99, '/images/products/workstation-package.jpg', 'Professional workstation setup with all necessary peripherals', ARRAY['Dual monitors', 'Ergonomic accessories', 'Docking station', 'Wireless peripherals', 'Professional installation'], 10, 4.7);

-- Create directory for product images
-- Note: Execute these commands in the terminal:
-- mkdir -p public/images/products
-- Then add the corresponding product images 