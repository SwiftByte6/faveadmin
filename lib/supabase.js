import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase config:', { 
  url: supabaseUrl, 
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length 
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const supabaseHelpers = {
  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .order('id', { ascending: false })
    return { data, error }
  },

  async getProduct(id) {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createProduct(product) {
    const { data, error } = await supabase
      .from('product')
      .insert([product])
      .select()
    return { data, error }
  },

  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('product')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async deleteProduct(id) {
    const { data, error } = await supabase
      .from('product')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Orders
  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getOrder(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async updateOrderStatus(id, status) {
    console.log('=== SUPABASE updateOrderStatus START ===');
    console.log('Input ID:', id, 'Type:', typeof id);
    console.log('Input Status:', status, 'Type:', typeof status);
    
    // Check if supabase client is initialized
    console.log('Supabase client exists:', !!supabase);
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase key exists:', !!supabaseAnonKey);
    
    try {
      const updatePayload = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      console.log('Update payload:', updatePayload);
      
      console.log('Executing update query...');
      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', id)
        .select()
      
      console.log('Raw Supabase response:');
      console.log('  - Data:', data);
      console.log('  - Error:', error);
      
      if (error) {
        console.error('=== SUPABASE ERROR BREAKDOWN ===');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Full error object:', JSON.stringify(error, null, 2));
      } else {
        console.log('=== SUPABASE SUCCESS ===');
        console.log('Number of rows affected:', data ? data.length : 0);
        if (data && data.length > 0) {
          console.log('Updated record:', data[0]);
        }
      }
      
      console.log('=== SUPABASE updateOrderStatus END ===');
      return { data, error }
    } catch (exception) {
      console.error('=== SUPABASE EXCEPTION ===');
      console.error('Exception caught in updateOrderStatus:', exception);
      console.error('Exception message:', exception.message);
      console.error('Exception stack:', exception.stack);
      
      return { 
        data: null, 
        error: { 
          message: `Exception in updateOrderStatus: ${exception.message}`,
          code: 'EXCEPTION',
          details: exception.stack
        } 
      };
    }
  },

  async getOrdersWithItems() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Customers
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getCustomer(id) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Analytics
  async getAnalyticsData() {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, created_at, status')

    const { data: products, error: productsError } = await supabase
      .from('product')
      .select('id, title, price, category')

    // Since there's no customers table, we'll use orders data for customer insights
    const { data: customers, error: customersError } = await supabase
      .from('orders')
      .select('name, email, created_at')

    return {
      orders: orders || [],
      products: products || [],
      customers: customers || [],
      errors: { ordersError, productsError, customersError }
    }
  },

  // Inventory
  async getInventory() {
    const { data, error } = await supabase
      .from('product')
      .select('id, title, price, quantity, category, images')
      .order('title')
    return { data, error }
  },

  async updateInventory(id, quantity) {
    const { data, error } = await supabase
      .from('product')
      .update({ quantity })
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Test function to manually update status
  async testStatusUpdate() {
    console.log('Testing direct status update...');
    
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user);
    console.log('User error:', userError);
    
    // First, let's get all orders to see what we have
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, status')
      .limit(1);
    
    console.log('Available orders:', orders);
    console.log('Orders error:', error);
    
    if (orders && orders.length > 0) {
      const orderId = orders[0].id;
      console.log('Testing update on order:', orderId);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'processing' })
        .eq('id', orderId)
        .select();
      
      console.log('Test update result:', { data, error });
      return { data, error };
    }
    
    return { data: null, error: { message: 'No orders found' } };
  }
}
