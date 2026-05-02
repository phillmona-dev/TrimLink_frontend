import { mockReviews } from "@/assets/mock-data";
import { Card } from "@/components/common/card";

export function BarberReviewsPage() {
  return (
    <Card>
      <h2 className="text-2xl font-black">Reviews received</h2>
      <div className="mt-6 space-y-4">
        {mockReviews.map((review) => (
          <div className="rounded-3xl border border-border p-5" key={review.id}>
            <div className="flex items-center justify-between">
              <div className="font-bold">{review.reviewerName}</div>
              <div className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">{review.rating}/5</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{review.comment}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
