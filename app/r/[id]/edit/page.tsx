'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const token = searchParams.get('token');

  useEffect(() => {
    // Store the token temporarily and redirect to admin
    if (token) {
      sessionStorage.setItem(`reservation_token_${id}`, token);
    }
    router.push(`/admin/reservations/${id}`);
  }, [id, token, router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-4" />
        <p className="text-text-muted">Redirection vers l&apos;interface d&apos;administration...</p>
      </div>
    </div>
  );
}
