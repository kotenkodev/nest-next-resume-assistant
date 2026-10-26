'use client';

import { analysisApi } from '@/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Button } from './ui/button';

export default function FitAnalysisView() {
  const params = useParams<{ id?: string[] }>();

  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['fit-analysis', params?.id?.[0]],
    queryFn: () => analysisApi.get(params?.id?.[0] || ''),
    enabled: !!params?.id?.[0],
  });

  const { mutate: analyzeFit, isLoading: isAnalyzing } = useMutation({
    mutationFn: analysisApi.run,
    onSuccess: (data) => {
      console.log('Fit analysis data:', data);
    },
  });

  return (
    <div>
      FitAnalysisView
      <Button>Run Fit Analysis</Button>
    </div>
  );
}
