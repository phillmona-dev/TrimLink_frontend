export type Role = "CUSTOMER" | "STAFF" | "OWNER" | "ADMIN";

export type PlatformUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  role: Role;
  active: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt?: string;
  staffProfile?: {
    id: string;
    bio?: string;
    experienceYears?: number;
    averageRating: number;
    totalReviews: number;
    available: boolean;
    shop?: {
      id: string;
      name: string;
      city: string;
      address: string;
      phone?: string;
    };
  };
};

export type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T;
  timestamp: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type UserSession = {
  userId: string;
  phone: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  newUser?: boolean;
};

export type Service = {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMinutes: number;
  imageUrl?: string;
  active?: boolean;
};

export type StaffProfile = {
  id: string;
  bio?: string;
  experienceYears?: number;
  averageRating: number;
  totalReviews: number;
  available: boolean;
  status: "IDLE" | "BUSY";
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    avatarUrl?: string;
  };
  serviceAssignments?: {
    id: string;
    serviceId: string;
    serviceName: string;
    serviceDescription?: string;
    durationMinutes: number;
    basePrice: number;
    customPrice?: number;
    effectivePrice: number;
    active: boolean;
  }[];
};

export type Shop = {
  id: string;
  name: string;
  phone?: string;
  address: string;
  city: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  bankAccounts?: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolder?: string;
  }[];
  active?: boolean;
};

export type Appointment = {
  id: string;
  customerId: string;
  customerName?: string;
  staffId: string;
  staffName?: string;
  shopId: string;
  shopName?: string;
  serviceId: string;
  serviceName?: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "REJECTED" | "RESCHEDULE_REQUESTED";
  priceCharged: number;
  notes?: string;
  cancellationReason?: string;
  receiptImageUrl?: string;
  reviewed: boolean;
  createdAt?: string;
};

export type QueueTicket = {
  entryId: string;
  customerId: string;
  staffId: string;
  staffName?: string;
  shopId: string;
  shopName?: string;
  serviceId: string;
  serviceName?: string;
  status: "WAITING" | "CALLED" | "IN_SERVICE" | "COMPLETED" | "CANCELLED" | "SKIPPED";
  position: number;
  estimatedWaitMinutes: number;
  joinedAt: string;
  calledAt?: string;
  serviceStartedAt?: string;
};

export type Payment = {
  id: string;
  txRef: string;
  provider: "CHAPA" | "TELEBIRR";
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
  amount: number;
  currency: string;
  checkoutUrl?: string;
  referenceId: string;
  referenceType: "APPOINTMENT" | "QUEUE_ENTRY";
  paidAt?: string;
  createdAt: string;
};

export type Review = {
  id: string;
  reviewId: string;
  appointmentId: string;
  staffId: string;
  staffName: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
};

export type DashboardMetric = {
  label: string;
  value: string | number;
  delta?: string;
};
