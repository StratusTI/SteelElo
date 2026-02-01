import { useQueries } from '@tanstack/react-query';

async function fetchMembersCount(enterpriseId: number): Promise<number> {
  const response = await fetch(`/api/company/members/count?enterpriseId=${enterpriseId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch members count');
  }

  const data = await response.json();
  return data.data.count;
}

export function useMembersCounts(enterpriseIds: number[]) {
  return useQueries({
    queries: enterpriseIds.map(id => ({
      queryKey: ['members-count', id],
      queryFn: () => fetchMembersCount(id),
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    })),
    combine: (results) => ({
      counts: results.reduce((acc, result, index) => {
        acc[enterpriseIds[index]] = result.data ?? null;
        return acc;
      }, {} as Record<number, number | null>),
      isLoading: results.some(r => r.isLoading),
      hasError: results.some(r => r.error),
    }),
  });
}
