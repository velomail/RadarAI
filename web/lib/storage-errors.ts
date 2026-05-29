/** User-facing message when Supabase Storage is misconfigured. */
export function storageUploadError(cause: string): Error {
  const lower = cause.toLowerCase();
  if (lower.includes('bucket') || lower.includes('not found')) {
    return new Error(
      'Supabase Storage bucket "resumes" is missing. In the Supabase dashboard → Storage, create a private bucket named resumes (public OFF, ~5MB limit), then ensure db/migrations/0003_storage.sql has been run.',
    );
  }
  return new Error(`Storage upload failed: ${cause}`);
}
