import nodemailer from 'nodemailer';

// Use environment variables in a real production environment
const SMTP_EMAIL = process.env.SMTP_EMAIL || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const ADMIN_EMAIL = 'quardcube.labs@gmail.com';

// Function to create a transporter based on the configuration
const createTransporter = () => {
  // For Gmail
  if (SMTP_EMAIL.includes('gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD
      }
    });
  }
  
  // For other SMTP providers (can be expanded based on needs)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Boolean(process.env.SMTP_SECURE) || false,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD
    }
  });
};

// For development environments without SMTP setup
const createTestTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.password'
    }
  });
};

// Create the appropriate transporter
let transporter: nodemailer.Transporter;

if (!SMTP_EMAIL || !SMTP_PASSWORD) {
  console.warn('Email notifications are disabled: SMTP credentials not provided');
  // Use a dummy transporter or Ethereal for testing
  transporter = createTestTransporter();
} else {
  transporter = createTransporter();
}

type OrderDetails = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  orderDate: string;
};

export async function sendOrderNotification(orderDetails: OrderDetails) {
  try {
    // Format the order items for better readability
    const itemsHTML = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Create the HTML content of the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #36e8d5; color: #00467f; padding: 20px; text-align: center;">
          <h1>New Order Notification - QuardCubeLabs</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Date:</strong> ${new Date(orderDetails.orderDate).toLocaleString()}</p>
          <p><strong>Customer Name:</strong> ${orderDetails.customerName}</p>
          <p><strong>Customer Email:</strong> ${orderDetails.customerEmail}</p>
          
          <h3>Shipping Address</h3>
          <p>
            ${orderDetails.shippingAddress.street || ''}<br>
            ${orderDetails.shippingAddress.city || ''} ${orderDetails.shippingAddress.state || ''} ${orderDetails.shippingAddress.postalCode || ''}<br>
            ${orderDetails.shippingAddress.country || ''}
          </p>
          
          <h3>Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #00467f; color: white;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: left;">Quantity</th>
                <th style="padding: 10px; text-align: left;">Price</th>
                <th style="padding: 10px; text-align: left;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr style="background-color: #f2f2f2;">
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px;"><strong>$${orderDetails.total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background-color: #00467f; color: white; padding: 15px; text-align: center;">
          <p>This is an automated notification from QuardCubeLabs. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"QuardCubeLabs Order System" <${SMTP_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New Order #${orderDetails.orderId}`,
      html: htmlContent,
    });

    console.log('Order notification email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      recipient: ADMIN_EMAIL,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending order notification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recipient: ADMIN_EMAIL,
      timestamp: new Date().toISOString()
    };
  }
}

// Function to send email to customer
export async function sendOrderConfirmationToCustomer(orderDetails: OrderDetails) {
  try {
    // Format the order items for better readability
    const itemsHTML = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Create the HTML content of the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #36e8d5; color: #00467f; padding: 20px; text-align: center;">
          <h1>Order Confirmation - QuardCubeLabs</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Thank you for your order!</h2>
          <p>Dear ${orderDetails.customerName},</p>
          <p>We're happy to confirm that we've received your order. Here are the details of your purchase:</p>
          
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Date:</strong> ${new Date(orderDetails.orderDate).toLocaleString()}</p>
          
          <h3>Shipping Address</h3>
          <p>
            ${orderDetails.shippingAddress.street || ''}<br>
            ${orderDetails.shippingAddress.city || ''} ${orderDetails.shippingAddress.state || ''} ${orderDetails.shippingAddress.postalCode || ''}<br>
            ${orderDetails.shippingAddress.country || ''}
          </p>
          
          <h3>Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #00467f; color: white;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: left;">Quantity</th>
                <th style="padding: 10px; text-align: left;">Price</th>
                <th style="padding: 10px; text-align: left;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr style="background-color: #f2f2f2;">
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px;"><strong>$${orderDetails.total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <p style="margin-top: 20px;">We'll notify you when your order has been shipped. If you have any questions, please contact our customer service.</p>
        </div>
        
        <div style="background-color: #00467f; color: white; padding: 15px; text-align: center;">
          <p>Thank you for shopping with QuardCubeLabs!</p>
        </div>
      </div>
    `;

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"QuardCubeLabs" <${SMTP_EMAIL}>`,
      to: orderDetails.customerEmail,
      subject: `Your Order Confirmation #${orderDetails.orderId}`,
      html: htmlContent,
    });

    console.log('Order confirmation email sent to customer:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      recipient: orderDetails.customerEmail,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending order confirmation email to customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recipient: orderDetails.customerEmail,
      timestamp: new Date().toISOString()
    };
  }
} 