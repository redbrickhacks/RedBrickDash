import { HibiscusRole } from '@hibiscus/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';

export default function FinalistPage() {
  const { user } = useHibiscusUser();
  const router = useRouter();

  useEffect(() => {
    if (user == null) return;
    if (![HibiscusRole.FINALIST, HibiscusRole.SUPERADMIN].includes(user.role)) {
      router.replace('/');
    }
  }, [router, user]);

  if (user == null) return <>Loading</>;

  if (![HibiscusRole.FINALIST, HibiscusRole.SUPERADMIN].includes(user.role)) {
    return null;
  }

  return (
    <div>
      <h1>Finalist Dashboard</h1>
      <p>Coming soon.</p>
    </div>
  );
}
