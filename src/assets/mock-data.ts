import type { Appointment, StaffProfile, Payment, QueueTicket, Review, Service, Shop } from "@/types";

export const featuredServices: Service[] = [
  { id: "svc-1", name: "Signature Fade", description: "Sharp modern fade and beard line-up.", basePrice: 220, durationMinutes: 45 },
  { id: "svc-2", name: "Classic Haircut", description: "Quick, clean everyday cut.", basePrice: 150, durationMinutes: 30 },
  { id: "svc-3", name: "Royal Grooming", description: "Cut, shave, steam towel, and finish.", basePrice: 420, durationMinutes: 75 }
];

export const featuredShops: Shop[] = [
  {
    id: "shop-1",
    name: "Bole Trim House",
    city: "Addis Ababa",
    address: "Bole Medhanialem, Addis Ababa",
    description: "Premium fades, fast queues, and polished service.",
    phone: "+251911222333"
  },
  {
    id: "shop-2",
    name: "Kazanchis Studio",
    city: "Addis Ababa",
    address: "Kazanchis Business District",
    description: "For busy professionals who book everything in advance.",
    phone: "+251911333444"
  },
  {
    id: "shop-3",
    name: "Hawassa Gentlemen's Club",
    city: "Hawassa",
    address: "Piazza Road, Hawassa",
    description: "Relaxed lounge feel with precise grooming.",
    phone: "+251911444555"
  }
];

export const featuredStaffs: StaffProfile[] = [
  {
    id: "staff-1",
    averageRating: 4.9,
    totalReviews: 182,
    available: true,
    experienceYears: 7,
    bio: "Skin fades and camera-ready detailing.",
    user: {
      id: "user-staff-1",
      firstName: "Henok",
      lastName: "Alem",
      phoneNumber: "+251911111111"
    },
    serviceAssignments: [
      { id: "assign-1", service: featuredServices[0], customPrice: 230, active: true },
      { id: "assign-2", service: featuredServices[2], customPrice: 450, active: true }
    ]
  },
  {
    id: "staff-2",
    averageRating: 4.7,
    totalReviews: 96,
    available: true,
    experienceYears: 5,
    bio: "Fast walk-ins, classic cuts, and tight beard shaping.",
    user: {
      id: "user-staff-2",
      firstName: "Dawit",
      lastName: "Mekonnen",
      phoneNumber: "+251922222222"
    },
    serviceAssignments: [{ id: "assign-3", service: featuredServices[1], customPrice: 160, active: true }]
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: "apt-1",
    customerId: "user-1",
    staffId: "staff-1",
    staffName: "Henok Alem",
    shopId: "shop-1",
    shopName: "Bole Trim House",
    serviceId: "svc-1",
    serviceName: "Signature Fade",
    scheduledStart: "2026-05-01T10:00:00",
    scheduledEnd: "2026-05-01T10:45:00",
    status: "CONFIRMED",
    priceCharged: 220,
    notes: "Front desk payment"
  },
  {
    id: "apt-2",
    customerId: "user-1",
    staffId: "staff-2",
    staffName: "Dawit Mekonnen",
    shopId: "shop-2",
    shopName: "Kazanchis Studio",
    serviceId: "svc-2",
    serviceName: "Classic Haircut",
    scheduledStart: "2026-04-24T13:30:00",
    scheduledEnd: "2026-04-24T14:00:00",
    status: "COMPLETED",
    priceCharged: 150
  }
];

export const mockQueueTicket: QueueTicket = {
  entryId: "queue-1",
  customerId: "user-1",
  staffId: "staff-1",
  staffName: "Henok Alem",
  shopId: "shop-1",
  shopName: "Bole Trim House",
  serviceId: "svc-1",
  serviceName: "Signature Fade",
  status: "WAITING",
  position: 3,
  estimatedWaitMinutes: 24,
  joinedAt: "2026-05-01T09:20:00"
};

export const mockPayments: Payment[] = [
  {
    id: "pay-1",
    txRef: "TRIM-ABC123456789",
    provider: "CHAPA",
    status: "SUCCESS",
    amount: 220,
    currency: "ETB",
    referenceId: "apt-1",
    referenceType: "APPOINTMENT",
    paidAt: "2026-04-29T09:00:00",
    createdAt: "2026-04-29T08:58:00",
    checkoutUrl: "https://checkout.chapa.co/mock"
  }
];

export const mockReviews: Review[] = [
  {
    id: "rev-1",
    staffProfileId: "staff-1",
    appointmentId: "apt-2",
    reviewerId: "user-1",
    rating: 5,
    comment: "Quick, sharp, and exactly what I asked for.",
    createdAt: "2026-04-24T16:00:00",
    reviewerName: "Ruth G."
  }
];

export const chartSeries = [
  { label: "Mon", value: 12000 },
  { label: "Tue", value: 17500 },
  { label: "Wed", value: 14200 },
  { label: "Thu", value: 19300 },
  { label: "Fri", value: 22500 },
  { label: "Sat", value: 26800 },
  { label: "Sun", value: 18200 }
];
