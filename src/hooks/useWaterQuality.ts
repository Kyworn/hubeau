import { useQuery } from '@tanstack/react-query';
import { fetchCommuneQuality } from '@/lib/hubeau';

export function useWaterQuality(postalCode: string) {
  return useQuery({
    queryKey: ['water-quality', postalCode],
    queryFn: () => fetchCommuneQuality(postalCode),
    enabled: !!postalCode && postalCode.length === 5,
    retry: 1,
  });
}
