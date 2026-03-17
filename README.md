# 🚗 QR Code-based Car Helpline System

A comprehensive Next.js 16 application for vehicle roadside assistance and service management using QR codes for quick vehicle identification.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🚗 User Features
- **QR Code Scanning**: Quick vehicle identification via QR codes
- **Emergency Assistance**: One-tap access to towing, mechanic, fuel, and accident assistance
- **Vehicle Dashboard**: Complete vehicle information and service history
- **Service Booking**: Book services at nearby garages with real-time availability
- **GPS Location**: Automatic location sharing for accurate assistance
- **Live Chat/Call**: Direct communication with helpline staff
- **Service History**: Complete maintenance and repair records

### 👨‍💼 Admin Features
- **Request Management**: View and manage all service requests
- **Real-time Dashboard**: Live status updates and analytics
- **Fleet Management**: Track service vehicles and staff
- **Garage Network**: Manage partner garages and mechanics
- **Analytics**: Comprehensive reporting and insights
- **Staff Assignment**: Assign requests to available mechanics

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Icons**: Lucide React
- **State Management**: React hooks and context

### Backend
- **Database**: SQLite with Prisma ORM
- **API**: RESTful API routes
- **Authentication**: Custom admin authentication
- **Real-time**: WebSocket ready architecture

### Development
- **Package Manager**: Bun
- **Code Quality**: ESLint with Next.js rules
- **Build**: Next.js optimized production builds

## 🚀 Installation

### Prerequisites
- Node.js 18+ or Bun
- Git

### Clone and Setup

1. **Clone the repository**
```bash
git clone https://github.com/jitenkr2030/QR-Code-based-Car-Helpline-system.git
cd QR-Code-based-Car-Helpline-system
```

2. **Install dependencies**
```bash
bun install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**
```bash
bun run db:push    # Push schema to database
bun run db:seed    # Seed with sample data
```

5. **Start development server**
```bash
bun run dev
```

6. **Open your browser**
- Main Application: [http://localhost:3000](http://localhost:3000)
- Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📱 Usage

### For Users

1. **Scan QR Code**: Click "Scan QR Code" to simulate scanning a vehicle's QR code
2. **View Dashboard**: Access vehicle information and service history
3. **Emergency Services**: Use one-tap buttons for immediate assistance
4. **Book Services**: Browse nearby garages and book appointments
5. **Track Requests**: Monitor service requests in real-time

### For Admins

1. **Login**: Access admin dashboard with credentials:
   - Username: `admin`
   - Password: `admin123`
2. **Manage Requests**: View, assign, and track service requests
3. **Monitor Fleet**: Track service vehicles and staff availability
4. **Analytics**: Review performance metrics and trends
5. **Settings**: Configure system parameters
6. **QR Code Management**: Generate and manage QR codes for vehicles

### QR Code Generation

#### Admin Service Workflow:

**🎯 How It Works:**
1. **Car Owner Registration**: Vehicle owners register their vehicles through the system
2. **QR Code Request**: Owners request QR codes during or after registration
3. **Admin Review**: Admin reviews and approves vehicle registrations
4. **QR Generation**: Admin generates unique QR codes for approved vehicles
5. **Delivery**: Admin prints and delivers QR codes to car owners
6. **Placement**: Car owners place QR codes on their vehicles

#### Who Generates QR Codes?

**👑 Admin (Centralized Service)**:
- Only the admin generates QR codes
- Generation happens only after vehicle registration approval
- QR codes are generated on request of car owners
- Admin maintains complete control over QR code distribution

**📋 Request Process:**
1. Car owner submits vehicle registration
2. Car owner requests QR code (automatic or manual)
3. Admin reviews registration details
4. Admin approves registration and generates QR code
5. Admin prints and delivers QR code to owner
6. Owner receives QR code and places on vehicle

#### Admin QR Code Management:

**Access**: Admin Dashboard → "QR Codes" tab

**Features**:
- View all vehicle registrations and QR requests
- Approve/reject vehicle registrations
- Generate unique QR codes for approved vehicles
- Print QR codes in various sizes (2x2", 3x3", 4x4")
- Track QR code delivery status
- Manage delivery methods (pickup, email, postal)

**QR Code Workflow**:
```
Car Owner → Register Vehicle → Request QR Code → Admin Review → Admin Approves → Admin Generates QR → Admin Delivers → Owner Places QR
```

#### QR Code Specifications:

**Format**: `QR-CAR-[LICENSE_PLATE]-[TIMESTAMP]-[RANDOM]`
- Unique for each vehicle
- Contains vehicle identification
- Timestamp for tracking
- Random component for security

**Physical QR Codes**:
- **Standard**: 2x2 inches (basic)
- **Premium**: 3x3 inches (recommended)
- **Large**: 4x4 inches (fleet vehicles)

**Placement Guidelines**:
- **Windshield** (Bottom center) - High visibility
- **Dashboard** (Left side) - Protected from weather
- **Door Jam** (Driver side) - Hidden but accessible
- **Key Fob** - Always with vehicle keys

## 📚 API Documentation

### Vehicles API

#### Get All Vehicles
```http
GET /api/vehicles
```

#### Get Vehicle by QR Code
```http
GET /api/vehicles?qr=<qr_code>
```

#### Create Vehicle
```http
POST /api/vehicles
Content-Type: application/json

{
  "qrCode": "QR-CAR-001",
  "vin": "1HGBH41JXMN109186",
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "licensePlate": "ABC-1234",
  "ownerId": "user_id"
}
```

### Bookings API

#### Get All Bookings
```http
GET /api/bookings
```

#### Get Bookings by Status
```http
GET /api/bookings?status=pending
```

#### Create Booking
```http
POST /api/bookings
Content-Type: application/json

{
  "serviceType": "towing",
  "description": "Flat tire on highway",
  "urgency": "high",
  "vehicleId": "vehicle_id",
  "userId": "user_id",
  "pickupAddress": "123 Highway 101",
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

### Garages API

#### Get All Garages
```http
GET /api/garages
```

#### Find Nearby Garages
```http
GET /api/garages?lat=37.7749&lng=-122.4194&radius=10
```

#### Create Garage
```http
POST /api/garages
Content-Type: application/json

{
  "name": "AutoCare Express",
  "address": "123 Main St, Downtown",
  "phone": "+1-555-0123",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "services": ["Oil Change", "Tire Service", "Brakes"]
}
```

### QR Codes API

#### Generate Single QR Code
```http
POST /api/qrcodes/generate
Content-Type: application/json

{
  "action": "generate_single",
  "vehicleData": {
    "vin": "1HGBH41JXMN109186",
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "licensePlate": "ABC-1234"
  }
}
```

#### Generate Bulk QR Codes
```http
POST /api/qrcodes/generate
Content-Type: application/json

{
  "action": "generate_bulk",
  "bulkVehicles": [
    {
      "vin": "1HGBH41JXMN109186",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "licensePlate": "ABC-1234"
    },
    {
      "vin": "2FTRX18W1XCA12345",
      "make": "Honda",
      "model": "Civic",
      "year": 2021,
      "licensePlate": "XYZ-789"
    }
  ]
}
```

#### Generate QR Codes for Stakeholder
```http
POST /api/qrcodes/generate
Content-Type: application/json

{
  "action": "generate_for_stakeholder",
  "stakeholder": "car_dealership"
}
```

#### Get QR Code Templates
```http
GET /api/qrcodes/generate?type=templates
```

#### Get Placement Guidelines
```http
GET /api/qrcodes/generate?type=placement_guide
```

#### Get Stakeholder Information
```http
GET /api/qrcodes/generate?type=stakeholders
```

## 🗄 Database Schema

### Core Models

#### User
- Vehicle owners and customers
- Authentication and profile management

#### Vehicle
- Vehicle information with QR codes
- Insurance and ownership details
- Service history and bookings

#### ServiceRecord
- Maintenance and repair history
- Cost and mileage tracking

#### Garage
- Service centers and partners
- Location and availability
- Services offered

#### Mechanic
- Service staff and technicians
- Specialties and availability

#### ServiceBooking
- Assistance requests and bookings
- Status tracking and assignments

#### ServiceAssignment
- Mechanic assignments and work tracking
- Completion status and notes

#### Admin
- System administrators
- Role-based access control

### Relationships
- Users own multiple vehicles
- Vehicles have service records and bookings
- Garages employ multiple mechanics
- Bookings are assigned to mechanics
- Service assignments track work progress

## 📁 Project Structure

```
QR-Code-based-Car-Helpline-system/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── garages/       # Garage operations
│   │   │   └── vehicles/      # Vehicle management
│   │   ├── admin/             # Admin dashboard
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main application
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── AdminDashboard.tsx # Admin interface
│   │   └── ServiceBooking.tsx # Booking system
│   └── lib/                   # Utilities
│       └── db.ts              # Database client
├── prisma/                    # Database configuration
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
├── public/                    # Static assets
├── db/                       # Database files
├── .env.example              # Environment template
├── package.json              # Dependencies
├── README.md                 # This file
└── bun.lockb                 # Lock file
```

## 🧪 Development

### Available Scripts

```bash
# Development
bun run dev              # Start development server
bun run build            # Build for production
bun run start            # Start production server
bun run lint             # Run ESLint

# Database
bun run db:push          # Push schema to database
bun run db:generate      # Generate Prisma client
bun run db:seed          # Seed sample data
bun run db:reset         # Reset database
```

### Code Quality

- **ESLint**: Comprehensive linting with Next.js rules
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting (recommended)
- **Prisma**: Type-safe database operations

## 🚀 Deployment

### Production Build

```bash
bun run build
bun start
```

### Environment Variables

```env
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "start"]
```

## 🌟 Business Model

### Revenue Streams

1. **Subscription Plans**: 
   - Individual: $9.99/month
   - Fleet: $49.99/month
   - Enterprise: Custom pricing

2. **Commission Fees**: 
   - 10% from partner garages
   - 15% from service providers

3. **Premium Features**:
   - Insurance integration
   - Concierge services
   - Advanced analytics

### Target Markets

1. **Individual Car Owners**: Personal vehicle assistance
2. **Fleet Operators**: Logistics and company vehicles
3. **Car Rental Services**: Rental fleet management
4. **Dealerships**: After-sales service programs

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:

- **Desktop**: Full-featured dashboard and management
- **Tablet**: Touch-optimized interface
- **Mobile**: Emergency-focused mobile experience

## 🔒 Security Features

- **Admin Authentication**: Secure dashboard access
- **Input Validation**: Comprehensive data sanitization
- **API Security**: Protected endpoints
- **Data Protection**: Encrypted sensitive information

## 📈 Scalability

### Performance Optimizations

- **Code Splitting**: Optimized bundle sizes
- **Lazy Loading**: On-demand component loading
- **Database Indexing**: Optimized queries
- **Caching Strategy**: Smart data caching

### Future Enhancements

- **Real-time Chat**: WebSocket integration
- **Mobile Apps**: React Native applications
- **AI Integration**: Predictive maintenance
- **Payment Processing**: Stripe integration
- **Notifications**: SMS and email alerts

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Update documentation as needed
- Test your changes thoroughly

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   bun run db:push
   bun run db:seed
   ```

2. **Port Already in Use**
   ```bash
   lsof -ti:3000 | xargs kill
   bun run dev
   ```

3. **Build Errors**
   ```bash
   bun run lint
   bun run build
   ```

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/jitenkr2030/QR-Code-based-Car-Helpline-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jitenkr2030/QR-Code-based-Car-Helpline-system/discussions)
- **Email**: support@carhelpline.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For immediate assistance:

- **Emergency Helpline**: 1-800-CAR-HELP
- **Email**: support@carhelpline.com
- **Documentation**: Available in the admin dashboard
- **Live Chat**: Available in the application

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database toolkit
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide](https://lucide.dev/) - Icon library

---

<div align="center">
  <p>© 2024 QR Code Car Helpline System. Emergency roadside assistance available 24/7</p>
  <p>Made with ❤️ by the development team</p>
</div>