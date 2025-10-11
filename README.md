# FaveAdmin - Women's Fashion E-commerce Admin Dashboard

A modern, girly-themed admin dashboard for women's fashion e-commerce built with Next.js, React, and Supabase.

## ✨ Features

- **🎀 Girly Design**: Beautiful pink/purple gradient theme perfect for fashion brands
- **📊 Dynamic Analytics**: Real-time data from Supabase with fallback mock data
- **👗 Product Management**: Complete inventory system for fashion items
- **🛍️ Order Management**: Track customer orders and fulfillment
- **👥 Customer Insights**: Manage customer relationships and VIP status
- **📊 Advanced Analytics**: Comprehensive reporting and insights
- **📱 Responsive Design**: Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (optional - works with mock data)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd faveadmin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional)
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup (Optional)

If you want to use Supabase for real data:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the SQL schema** from `SqlSchema.md` in your Supabase SQL editor

3. **Update your environment variables** with your project credentials

4. **The app will automatically use Supabase data** - if Supabase is not configured, it falls back to beautiful mock data

## 📁 Project Structure

```
faveadmin/
├── app/                    # Next.js app directory
│   ├── analytics/         # Analytics dashboard
│   ├── customers/         # Customer management
│   ├── dashboard/         # Main dashboard
│   ├── inventory/         # Product inventory
│   ├── orders/           # Order management
│   └── products/         # Product catalog
├── components/            # Reusable components
│   ├── charts/           # Chart components
│   ├── dashboard/        # Dashboard widgets
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Utilities and configurations
│   └── supabase.js       # Supabase client and helpers
└── SqlSchema.md          # Database schema
```

## 🎨 Design System

- **Colors**: Pink, purple, rose, fuchsia gradients
- **Typography**: Clean, modern fonts
- **Icons**: Emoji-based icons for a fun, girly feel
- **Layout**: Responsive grid system with cards
- **Components**: Consistent styling across all pages

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 📊 Features Overview

### Dashboard
- Real-time KPI cards
- Revenue and order charts
- Product analytics
- Customer insights
- Recent orders
- Advanced analytics

### Products
- Product catalog management
- Inventory tracking
- Category organization
- Stock level monitoring
- Price management

### Orders
- Order processing workflow
- Status tracking
- Customer information
- Order history
- Fulfillment management

### Customers
- Customer database
- VIP status tracking
- Order history
- Contact management
- Loyalty points


### Analytics
- Comprehensive reporting
- Data visualization
- Performance insights
- Trend analysis
- Export capabilities

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Charts**: Chart.js, React Chart.js 2
- **Icons**: Custom emoji-based system
- **Deployment**: Vercel-ready

## 🎯 Key Features

### Dynamic Data
- Real-time Supabase integration
- Automatic fallback to mock data
- Error handling and loading states
- Optimistic updates

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Adaptive layouts

### Performance
- Server-side rendering
- Image optimization
- Code splitting
- Lazy loading

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app is built with standard Next.js and can be deployed to:
- Netlify
- Railway
- DigitalOcean
- AWS
- Any Node.js hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🎉 Getting Started

1. **Clone and install** as shown above
2. **Run `npm run dev`** to start the development server
3. **Explore the dashboard** - it works immediately with mock data
4. **Optionally set up Supabase** for real data integration
5. **Customize the theme** and add your brand colors
6. **Deploy to production** when ready

## 💡 Tips

- The app works perfectly without Supabase - mock data provides a complete demo
- All pages are fully functional with realistic data
- The girly theme can be easily customized in the CSS
- Add your own products, customers, and orders to the mock data
- Use the Supabase integration for production use

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your environment variables
3. Ensure Node.js version is 18+
4. Try deleting node_modules and reinstalling
5. Check the Supabase connection if using real data

---

**Built with ❤️ for women's fashion brands**

Enjoy your beautiful, functional admin dashboard! 🎀✨