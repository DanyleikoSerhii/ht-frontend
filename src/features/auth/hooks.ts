import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';

import { getMe, logout } from './api';
import { type MeResponse } from './schemas';

export function useAuth(): UseQueryResult<MeResponse> {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    staleTime: Infinity,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}
