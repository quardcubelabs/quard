"use server"

import { products } from "@/lib/data"
import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendOrderNotification, sendOrderConfirmationToCustomer } from "@/lib/email-service"
import { randomUUID } from "crypto"

// Type definitions
interface CartItem {
  id: string;
  quantity: number;
  name?: string;
  price?: number;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  [key: string]: any;
}

interface UserData {
  name: string;
  email: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

// Contact form submission
export async function submitContactForm(formData: FormData) {
  // In a real application, you would send this data to your backend or a service like SendGrid
  const name = formData.get("name")
  const email = formData.get("email")
  const subject = formData.get("subject")
  const message = formData.get("message")

  console.log("Contact form submitted:", { name, email, subject, message })

  // Simulate a delay to mimic server processing
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    message: "Thank you for your message! We will get back to you soon.",
  }
}

// Create an order
export async function createOrder(productId: string, quantity: number, userId: string, userData: UserData) {
  console.log('Creating order for product:', productId);
  console.log('Quantity:', quantity);
  console.log('User ID:', userId);
  console.log('User data:', userData);

  try {
    // Create Supabase client
    const supabase = createServerClient();
    
    // Fetch product details
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
      
    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }
    
    if (!productData) {
      throw new Error(`Product not found: ${productId}`);
    }
    
    // Check stock
    if (productData.stock < quantity) {
      throw new Error(`Insufficient stock for ${productData.name}. Available: ${productData.stock}, Requested: ${quantity}`);
    }

    // Create the order
    const orderId = randomUUID();
    
    const orderItem = {
      id: productId,
      name: productData.name,
      price: productData.price,
      quantity: quantity,
    };

    const totalAmount = orderItem.price * quantity;
    
    // Format shipping address from user data
    const shippingAddress = {
      street: userData.street || '',
      city: userData.city || '',
      state: userData.state || '',
      country: userData.country || 'Tanzania',
      postalCode: userData.postal_code || '',
    };
    
    const orderData = {
      id: orderId,
      user_id: userId,
      items: [orderItem],
      total_amount: totalAmount,
      customer_name: userData.name,
      customer_email: userData.email,
      shipping_address: shippingAddress,
      payment_method: 'Credit Card', // Default payment method
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Insert order into Supabase
    const { error: orderError } = await supabase
      .from('orders')
      .insert(orderData);
      
    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }
    
    console.log(`Order created with ID: ${orderId}`);

    // Update product stock
    const newStock = productData.stock - quantity;
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);
      
    if (updateError) {
      console.error(`Failed to update stock for product ${productId}: ${updateError.message}`);
    } else {
      console.log(`Updated stock for ${productData.name}: ${productData.stock} → ${newStock}`);
    }

    // Send email notifications
    console.log('Attempting to send email notifications for order:', orderId);
    
    const orderDetails = {
      orderId,
      customerName: userData.name,
      customerEmail: userData.email,
      items: [{
        name: productData.name,
        quantity: quantity,
        price: productData.price
      }],
      total: totalAmount,
      shippingAddress: shippingAddress,
      orderDate: new Date().toISOString()
    };

    // Send notification to admin
    const adminEmailResult = await sendOrderNotification(orderDetails);
    console.log('Admin notification result:', adminEmailResult);
    
    // Send confirmation to customer if email provided
    let customerEmailResult = null;
    if (userData.email) {
      customerEmailResult = await sendOrderConfirmationToCustomer(orderDetails);
      console.log('Customer confirmation result:', customerEmailResult);
    } else {
      console.log('No customer email provided, skipping confirmation email');
    }
    
    return {
      success: true,
      orderId,
      emailResults: {
        admin: adminEmailResult,
        customer: customerEmailResult
      }
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

// Newsletter subscription
export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email")

  console.log("Newsletter subscription:", email)

  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    message: "Thank you for subscribing to our newsletter!",
  }
}
