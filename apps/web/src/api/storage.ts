export async function uploadBinaryToS3(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error(
      `Failed to upload file directly to S3 (status ${res.status})`,
    );
  }
}
