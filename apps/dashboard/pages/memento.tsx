import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

type ApiResponse =
  | { message: string }
  | {
      data: unknown;
    };

export default function MementoPage() {
  const router = useRouter();

  const key = useMemo(() => {
    const raw = router.query.key;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return typeof value === 'string' ? value.trim() : '';
  }, [router.query.key]);

  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    data: unknown | null;
  }>({ loading: false, error: null, data: null });

  useEffect(() => {
    if (!router.isReady) return;
    if (!key) return;

    const run = async () => {
      setState({ loading: true, error: null, data: null });
      try {
        const res = await fetch('/api/memento', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ key }),
        });
        const json = (await res.json()) as ApiResponse;

        if (!res.ok) {
          const message =
            typeof (json as { message?: unknown }).message === 'string'
              ? (json as { message: string }).message
              : 'Failed to load memento';
          setState({ loading: false, error: message, data: null });
          return;
        }

        setState({
          loading: false,
          error: null,
          data: (json as { data: unknown }).data,
        });
      } catch {
        setState({
          loading: false,
          error: 'Failed to load memento',
          data: null,
        });
      }
    };

    run();
  }, [router.isReady, key]);

  // Intentionally minimal for now; this will become the personalized memento page UI.
  if (!router.isReady) return null;
  if (!key) return null;
  if (state.loading) return null;

  if (state.error) {
    return <div>{state.error}</div>;
  }

  if (!state.data) return null;

  return <pre>{JSON.stringify(state.data, null, 2)}</pre>;
}
