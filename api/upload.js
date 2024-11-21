import { put } from '@vercel/blob';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  try {
    const blob = await put(`${filename}`, request.body, { access: 'public' });

    // Log the blob data to the console (for debugging purposes)
    console.log('------------------------------------');
    console.log(blob);  // Log the blob object directly
    console.log('------------------------------------');

    // Return the blob as JSON response
    return new Response(JSON.stringify(blob), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error uploading file:', error);  // Log the error for debugging
    return new Response(
      JSON.stringify({ error: 'Failed to upload file' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// The next lines are required for Pages API Routes only
export const config = {
  api: {
    bodyParser: false,
  },
};
