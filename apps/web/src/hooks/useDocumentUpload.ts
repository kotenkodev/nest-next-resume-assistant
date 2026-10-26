import { resumesApi, jobsApi, uploadBinaryToS3 } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDocumentUpload() {
  const queryClient = useQueryClient();

  const uploadMultiple = async (files: File[], target: 'resume' | 'job') => {
    const api = target === 'resume' ? resumesApi : jobsApi;
    const toastId = toast.loading(
      `Uploading ${files.length} ${target === 'resume' ? 'resume(s)' : 'job posting(s)'}...`,
    );

    try {
      const results = await Promise.allSettled(
        files.map(async (file) => {
          const { id, uploadUrl } = await api.initiateUpload({
            fileName: file.name,
            contentType: file.type || 'application/pdf',
            fileSize: file.size,
          });

          await uploadBinaryToS3(uploadUrl, file);

          await api.completeUpload(id);

          return file.name;
        }),
      );

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      queryClient.invalidateQueries({
        queryKey: [target === 'resume' ? 'resumes' : 'jobs'],
      });

      if (failed === 0) {
        toast.success(`Successfully uploaded ${succeeded} file(s)`, {
          id: toastId,
        });
      } else {
        toast.warning(`Uploaded ${succeeded} file(s), ${failed} failed`, {
          id: toastId,
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed', { id: toastId });
    }
  };

  return { uploadMultiple };
}
