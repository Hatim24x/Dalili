import React from 'react';
import { Review } from '@/src/types';
import { Star, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">{t('reviews')}</h3>
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{review.userName}</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-bold text-neutral-900">{review.rating}</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic">No reviews yet.</p>
      )}
    </div>
  );
}
