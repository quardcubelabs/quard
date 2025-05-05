-- Add new products
INSERT INTO products (name, category, price, image, description, features, stock, rating) VALUES
-- Software Development Category
('Enterprise ERP Solution', 'Software Development', 2499.99, '/images/products/erp-solution.jpg', 'Comprehensive enterprise resource planning solution for large businesses', ARRAY['Modular architecture', 'Real-time analytics', 'Multi-branch support', 'Customizable workflows', 'API integration'], 5, 4.8),
('Mobile App Development Kit', 'Software Development', 899.99, '/images/products/mobile-dev-kit.jpg', 'Complete toolkit for developing cross-platform mobile applications', ARRAY['iOS & Android support', 'UI component library', 'Push notification system', 'Analytics integration', 'Offline capability'], 15, 4.7),

-- Security Products Category
('Advanced Firewall System', 'Security Products', 1299.99, '/images/products/firewall-system.jpg', 'Next-generation firewall with advanced threat protection', ARRAY['Deep packet inspection', 'Intrusion prevention', 'VPN support', 'Real-time monitoring', 'Cloud integration'], 8, 4.9),
('Biometric Access Control', 'Security Products', 799.99, '/images/products/biometric-access.jpg', 'Multi-factor biometric authentication system for secure access control', ARRAY['Fingerprint scanning', 'Facial recognition', 'Mobile app integration', 'Audit logging', 'Time attendance tracking'], 12, 4.6),

-- IT Products Category
('Server Rack Bundle', 'IT Products', 3499.99, '/images/products/server-rack.jpg', 'Complete server rack solution with networking equipment', ARRAY['42U rack cabinet', 'PDU included', 'Cable management', 'Cooling system', 'Installation service'], 3, 4.8),
('Workstation Setup Package', 'IT Products', 1599.99, '/images/products/workstation-package.jpg', 'Professional workstation setup with all necessary peripherals', ARRAY['Dual monitors', 'Ergonomic accessories', 'Docking station', 'Wireless peripherals', 'Professional installation'], 10, 4.7),

-- Power Solutions Category
('Smart UPS System', 'Power Solutions', 1199.99, '/images/products/smart-ups.jpg', 'Intelligent uninterruptible power supply for critical infrastructure', ARRAY['Remote monitoring', 'Automatic voltage regulation', 'Battery backup', 'Energy efficient', 'Mobile alerts'], 7, 4.8),
('Solar Power Kit', 'Power Solutions', 2499.99, '/images/products/solar-power-kit.jpg', 'Complete solar power kit for small businesses', ARRAY['High-efficiency panels', 'Inverter included', 'Battery storage', 'Easy installation', 'Remote monitoring'], 5, 4.7),
('Industrial Power Management', 'Power Solutions', 3999.99, '/images/products/industrial-power.jpg', 'Advanced power management for industrial applications', ARRAY['Load balancing', 'Energy analytics', 'Remote control', 'Redundancy', 'Custom alerts'], 2, 4.9),
('Backup Generator Controller', 'Power Solutions', 899.99, '/images/products/generator-controller.jpg', 'Automated generator controller for seamless power backup', ARRAY['Auto start/stop', 'Remote diagnostics', 'Load transfer', 'Maintenance alerts', 'Mobile app'], 6, 4.6),

-- Connectivity & Networking Category
('Enterprise WiFi System', 'Connectivity & Networking', 1499.99, '/images/products/enterprise-wifi.jpg', 'High-performance WiFi system for large offices', ARRAY['Seamless roaming', 'Guest network', 'Centralized management', 'Security features', 'Scalable'], 8, 4.8),
('Managed Switch 48-Port', 'Connectivity & Networking', 799.99, '/images/products/managed-switch.jpg', '48-port managed network switch with PoE', ARRAY['Layer 2/3 support', 'PoE+ ports', 'VLAN management', 'Web interface', 'Energy efficient'], 12, 4.7),
('Business Router Pro', 'Connectivity & Networking', 599.99, '/images/products/business-router.jpg', 'Professional-grade router for business connectivity', ARRAY['Dual WAN', 'VPN support', 'Firewall', 'QoS', 'Remote management'], 10, 4.6),
('Fiber Optic Starter Kit', 'Connectivity & Networking', 1299.99, '/images/products/fiber-optic-kit.jpg', 'Starter kit for fiber optic network installations', ARRAY['Cables included', 'Connectors', 'Testing tools', 'Installation guide', 'Support'], 4, 4.7),

-- Web Designing Category
('E-Commerce Website Package', 'Web Designing', 1999.99, '/images/products/ecommerce-website.jpg', 'Complete e-commerce website design and setup', ARRAY['Custom design', 'Payment integration', 'SEO optimized', 'Mobile responsive', 'Admin dashboard'], 10, 4.9),
('Corporate Website Bundle', 'Web Designing', 1499.99, '/images/products/corporate-website.jpg', 'Professional corporate website design bundle', ARRAY['Branding', 'Content management', 'Analytics', 'Contact forms', 'Blog setup'], 12, 4.8),
('Landing Page Express', 'Web Designing', 499.99, '/images/products/landing-page.jpg', 'Fast and effective landing page design service', ARRAY['Conversion optimized', 'A/B testing', 'Mobile first', 'Custom graphics', 'Analytics'], 20, 4.7),
('Portfolio Website Kit', 'Web Designing', 799.99, '/images/products/portfolio-website.jpg', 'Modern portfolio website kit for professionals', ARRAY['Gallery', 'Contact form', 'Blog', 'Social media integration', 'Custom themes'], 15, 4.6),

-- Software Development Category (more)
('Custom CRM Platform', 'Software Development', 2999.99, '/images/products/crm-platform.jpg', 'Customizable CRM platform for sales and support teams', ARRAY['Lead management', 'Pipeline tracking', 'Email integration', 'Reporting', 'Role-based access'], 6, 4.8),
('AI Chatbot Solution', 'Software Development', 1199.99, '/images/products/ai-chatbot.jpg', 'AI-powered chatbot for customer support automation', ARRAY['Natural language processing', '24/7 support', 'Integration ready', 'Analytics', 'Custom workflows'], 9, 4.7),
('Inventory Management Suite', 'Software Development', 1799.99, '/images/products/inventory-suite.jpg', 'Comprehensive inventory management software', ARRAY['Barcode scanning', 'Stock alerts', 'Supplier management', 'Reporting', 'Multi-location'], 8, 4.7),
('HR Management System', 'Software Development', 1599.99, '/images/products/hr-system.jpg', 'HR management system for employee records and payroll', ARRAY['Attendance tracking', 'Payroll', 'Leave management', 'Self-service portal', 'Reports'], 7, 4.6),

-- Security Products Category (more)
('Network Intrusion Detection', 'Security Products', 1399.99, '/images/products/intrusion-detection.jpg', 'Real-time network intrusion detection system', ARRAY['Signature-based', 'Anomaly detection', 'Alerting', 'Dashboard', 'Log management'], 5, 4.8),
('Smart CCTV Kit', 'Security Products', 999.99, '/images/products/smart-cctv.jpg', 'Smart CCTV kit with cloud storage and mobile access', ARRAY['HD cameras', 'Night vision', 'Cloud storage', 'Mobile app', 'Motion alerts'], 10, 4.7),
('Secure Email Gateway', 'Security Products', 799.99, '/images/products/email-gateway.jpg', 'Email security gateway for spam and phishing protection', ARRAY['Spam filtering', 'Phishing protection', 'Attachment scanning', 'Quarantine', 'Reporting'], 12, 4.6),
('Access Badge Printer', 'Security Products', 499.99, '/images/products/badge-printer.jpg', 'Printer for secure employee access badges', ARRAY['High resolution', 'RFID encoding', 'Fast printing', 'Custom templates', 'USB connectivity'], 8, 4.5),

-- IT Products Category (more)
('All-in-One Desktop', 'IT Products', 1299.99, '/images/products/all-in-one-desktop.jpg', 'Space-saving all-in-one desktop computer', ARRAY['23-inch display', 'SSD storage', 'Wireless keyboard/mouse', 'Webcam', 'Pre-installed software'], 14, 4.7),
('Business Laptop Pro', 'IT Products', 1799.99, '/images/products/business-laptop.jpg', 'High-performance laptop for business users', ARRAY['i7 processor', '16GB RAM', '512GB SSD', 'Fingerprint reader', 'Long battery life'], 11, 4.8),
('Network Attached Storage', 'IT Products', 999.99, '/images/products/nas.jpg', 'Network attached storage for secure file sharing', ARRAY['RAID support', 'Remote access', 'Backup', 'User management', 'Expandable'], 7, 4.7),
('Conference Room Kit', 'IT Products', 2199.99, '/images/products/conference-kit.jpg', 'Complete kit for modern conference rooms', ARRAY['Video conferencing', 'Wireless sharing', 'Speakerphone', 'Touch control', 'Easy setup'], 5, 4.8); 